import { supabaseServer } from "@/lib/supabase-server";
import { createActivity } from "@/lib/activity/create-activity";

type CreateReminderInput = {
  title: string;
  dueDate: string;

  assetId?: string | null;
  personalRecordId?: string | null;
};

export async function createReminder(
  input: CreateReminderInput
) {
  const { data: reminder, error } = await supabaseServer
    .from("reminders")
    .insert({
      title: input.title,
      due_date: input.dueDate,

      asset_id: input.assetId ?? null,
      personal_record_id:
        input.personalRecordId ?? null,
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

    activityType: "reminder_created",

    title: `Created reminder: ${input.title}`,
  });

  return reminder;
}