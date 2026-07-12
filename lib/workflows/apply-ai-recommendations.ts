import { WORKFLOW_REGISTRY } from "./registry";
import { WorkflowContext } from "./types";

export async function applyAiRecommendations(
  actions: string[],
  context: WorkflowContext
): Promise<WorkflowContext> {

  const workflowContext = { ...context };

  for (const action of actions) {
    const workflow = WORKFLOW_REGISTRY[action];

    if (!workflow) {
      console.warn(`Unknown workflow action: ${action}`);
      continue;
    }

    const updates = await workflow(workflowContext);

    if (updates) {
      Object.assign(workflowContext, updates);
    }
  }

  return workflowContext;
}