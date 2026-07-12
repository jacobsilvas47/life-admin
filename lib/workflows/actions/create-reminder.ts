import { createReminder } from "@/lib/reminders/create-reminder";
import { WorkflowContext } from "../types";

export async function createReminderWorkflow(
  context: WorkflowContext
) {
  const title =
    context.recordTitle ??
    context.assetName ??
    "Reminder";

  if (!context.expirationDate) {
    return;
  }

  await createReminder({
    title: `Renew ${title}`,
    dueDate: context.expirationDate,

    assetId: context.assetId ?? null,
    personalRecordId: context.personalRecordId ?? null,
  });
}