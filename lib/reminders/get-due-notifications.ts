import { supabaseServer } from "@/lib/supabase-server";
import { getUserSettings } from "@/lib/settings/get-user-settings";

export type DueReminderNotification = {
  reminderId: string;
  title: string;
  dueDate: string;
  notificationOffset: number;

  assetId: string | null;
  personalRecordId: string | null;
  warrantyId: string | null;

  notes: string | null;
};

function getDateOnly(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(
  dateString: string,
  days: number
) {
  const date = new Date(
    `${dateString}T12:00:00`
  );

  date.setDate(date.getDate() + days);

  return getDateOnly(date);
}

export async function getDueNotifications() {
  const settings = await getUserSettings();

  if (!settings.email_notifications) {
    return [];
  }

  const today = getDateOnly(new Date());

  const { data: reminders, error } =
    await supabaseServer
      .from("reminders")
      .select(`
        id,
        title,
        due_date,
        completed,
        notification_offsets,
        notes,
        asset_id,
        personal_record_id,
        warranty_id
      `)
      .eq("completed", false);

  if (error) {
    throw new Error(error.message);
  }

  const dueNotifications:
    DueReminderNotification[] = [];

  for (const reminder of reminders ?? []) {
    const offsets =
      reminder.notification_offsets ?? [];

    for (const offset of offsets) {
      /*
       * Example:
       *
       * Due: August 31
       * Offset: 30
       *
       * Notification date:
       * August 1
       */
      const notificationDate = addDays(
        reminder.due_date,
        -offset
      );

      if (notificationDate !== today) {
        continue;
      }

      const {
        data: existingNotification,
        error: existingError,
      } = await supabaseServer
        .from("reminder_notifications")
        .select("id")
        .eq("reminder_id", reminder.id)
        .eq("notification_offset", offset)
        .eq("channel", "email")
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      if (existingNotification) {
        continue;
      }

      dueNotifications.push({
        reminderId: reminder.id,
        title: reminder.title,
        dueDate: reminder.due_date,
        notificationOffset: offset,

        assetId: reminder.asset_id,
        personalRecordId:
          reminder.personal_record_id,
        warrantyId: reminder.warranty_id,

        notes: reminder.notes,
      });
    }
  }

  return dueNotifications;
}