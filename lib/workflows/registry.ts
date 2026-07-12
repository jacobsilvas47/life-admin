import { createAssetWorkflow } from "./actions/create-asset";
import { WorkflowContext } from "./types";
import { createPersonalRecordWorkflow } from "./actions/create-personal-record";
import { createReminderWorkflow } from "./actions/create-reminder";

export type WorkflowAction = (
  context: WorkflowContext
) => Promise<Partial<WorkflowContext> | void>;

export const WORKFLOW_REGISTRY: Record<
  string,
  WorkflowAction
> = {
  create_asset: createAssetWorkflow,
  create_personal_record: createPersonalRecordWorkflow,
  create_renewal_reminder: createReminderWorkflow,
};