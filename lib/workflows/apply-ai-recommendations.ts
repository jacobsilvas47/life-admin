import { WORKFLOW_REGISTRY } from "./registry";
import { WorkflowContext } from "./types";

export async function applyAiRecommendations(
  actions: string[],
  context: WorkflowContext
): Promise<void> {
  for (const action of actions) {
    const workflow = WORKFLOW_REGISTRY[action];

    if (!workflow) {
      console.warn(`Unknown workflow action: ${action}`);
      continue;
    }

    await workflow(context);
  }
}