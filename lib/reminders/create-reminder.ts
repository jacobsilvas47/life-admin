import { supabaseServer } from "@/lib/supabase-server";
import { createActivity } from "@/lib/activity/create-activity";
import { getUserSettings } from "@/lib/settings/get-user-settings";

type CreateReminderInput = {
  title: string;
  dueDate: string;

  assetId?: string | null;
  personalRecordId?: string | null;
  warrantyId?: string | null;

  notificationOffsets?: number[] | null;
  notes?: string | null;
};

export async function createReminder(
  input: CreateReminderInput
) {
  const settings = await getUserSettings();

  const notificationOffsets =
    input.notificationOffsets ??
    settings.default_notification_offsets;

  const { data: reminder, error } =
    await supabaseServer
      .from("reminders")
      .insert({
        title: input.title,
        due_date: input.dueDate,

        asset_id: input.assetId ?? null,
        personal_record_id:
          input.personalRecordId ?? null,
        warranty_id: input.warrantyId ?? null,

        notification_offsets:
          notificationOffsets,

        notes: input.notes ?? null,
      })
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  await createActivity({
    assetId: input.assetId ?? undefined,
    personalRecordId:
      input.personalRecordId ?? undefined,
    warrantyId: input.warrantyId ?? undefined,

    activityType: "reminder_created",
    title: `Created reminder: ${input.title}`,
  });

  return reminder;
}