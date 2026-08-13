import { supabaseServer } from "@/lib/supabase-server";
import type { DateFormat } from "@/lib/date/format-date";

export type DueReminderNotification = {
  reminderId: string;
  userId: string;

  title: string;
  dueDate: string;
  notificationOffset: number;

  assetId: string | null;
  personalRecordId: string | null;
  warrantyId: string | null;

  notes: string | null;

  email: string;
  dateFormat: DateFormat;
  timezone: string;
};

function getDateInTimezone(
  timezone: string
) {
  const formatter = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );

  const parts = formatter.formatToParts(
    new Date()
  );

  const year = parts.find(
    (part) => part.type === "year"
  )?.value;

  const month = parts.find(
    (part) => part.type === "month"
  )?.value;

  const day = parts.find(
    (part) => part.type === "day"
  )?.value;

  return `${year}-${month}-${day}`;
}

function addDays(
  dateString: string,
  days: number
) {
  const [year, month, day] =
    dateString.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date.toISOString().slice(0, 10);
}

export async function getDueNotifications() {
  /*
   * The cron uses the service-role client,
   * so it can inspect reminders for all users.
   */
  const { data: reminders, error } =
    await supabaseServer
      .from("reminders")
      .select(`
        id,
        user_id,
        title,
        due_date,
        completed,
        notification_offsets,
        notes,
        asset_id,
        personal_record_id,
        warranty_id
      `)
      .eq("completed", false)
      .not("user_id", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  const dueNotifications:
    DueReminderNotification[] = [];

  for (const reminder of reminders ?? []) {
    if (!reminder.user_id) {
      continue;
    }

    /*
     * Load settings belonging specifically
     * to this reminder's owner.
     */
    const {
      data: settings,
      error: settingsError,
    } = await supabaseServer
      .from("user_settings")
      .select(`
        date_format,
        timezone,
        email_notifications
      `)
      .eq("user_id", reminder.user_id)
      .maybeSingle();

    if (settingsError) {
      throw new Error(
        settingsError.message
      );
    }

    /*
     * Respect the user's notification
     * preference.
     */
    if (
      settings &&
      settings.email_notifications === false
    ) {
      continue;
    }

    const timezone =
      settings?.timezone ??
      "America/Los_Angeles";

    const dateFormat: DateFormat =
      settings?.date_format === "DD/MM/YYYY" ||
      settings?.date_format === "YYYY-MM-DD"
        ? settings.date_format
        : "MM/DD/YYYY";

    const today =
      getDateInTimezone(timezone);

    /*
     * Get this user's email directly from
     * Supabase Auth.
     *
     * This is safe here because this code
     * runs server-side with the service role.
     */
    const {
      data: userData,
      error: userError,
    } =
      await supabaseServer.auth.admin.getUserById(
        reminder.user_id
      );

    if (userError) {
      throw new Error(userError.message);
    }

    const email = userData.user?.email;

    if (!email) {
      console.error(
        `No email found for user ${reminder.user_id}`
      );

      continue;
    }

    const offsets:
      number[] =
      reminder.notification_offsets ?? [];

    for (const offset of offsets) {
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
        .eq(
          "reminder_id",
          reminder.id
        )
        .eq(
          "notification_offset",
          offset
        )
        .eq("channel", "email")
        .maybeSingle();

      if (existingError) {
        throw new Error(
          existingError.message
        );
      }

      if (existingNotification) {
        continue;
      }

      dueNotifications.push({
        reminderId: reminder.id,
        userId: reminder.user_id,

        title: reminder.title,
        dueDate: reminder.due_date,
        notificationOffset: offset,

        assetId: reminder.asset_id,
        personalRecordId:
          reminder.personal_record_id,
        warrantyId:
          reminder.warranty_id,

        notes: reminder.notes,

        email,
        dateFormat,
        timezone,
      });
    }
  }

  return dueNotifications;
}