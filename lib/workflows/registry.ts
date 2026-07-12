import { createAssetWorkflow } from "./actions/create-asset";
import { WorkflowContext } from "./types";
import { createPersonalRecordWorkflow } from "./actions/create-personal-record";

export type WorkflowAction = (
  context: WorkflowContext
) => Promise<void>;

export const WORKFLOW_REGISTRY: Record<
  string,
  WorkflowAction
> = {
  create_asset: createAssetWorkflow,
  create_personal_record: createPersonalRecordWorkflow,
};