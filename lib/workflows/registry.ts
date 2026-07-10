import { createAssetWorkflow } from "./actions/create-asset";
import { WorkflowContext } from "./types";

export type WorkflowAction = (
  context: WorkflowContext
) => Promise<void>;

export const WORKFLOW_REGISTRY: Record<
  string,
  WorkflowAction
> = {
  create_asset: createAssetWorkflow,
};