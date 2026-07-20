import { createReminder } from "@/lib/reminders/create-reminder";
import { WorkflowContext } from "../types";

export async function createWarrantyReminderWorkflow(
  context: WorkflowContext
) {
  if (!context.expirationDate) {
    return;
  }

  await createReminder({
    title: "Warranty Expiration",
    dueDate: context.expirationDate,

    assetId: context.assetId,
    warrantyId: context.warrantyId,
  });
}