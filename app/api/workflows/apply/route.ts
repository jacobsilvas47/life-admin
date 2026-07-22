import { NextResponse } from "next/server";
import { applyAiRecommendations } from "@/lib/workflows/apply-ai-recommendations";
import { WorkflowContext } from "@/lib/workflows/types";

export async function POST(req: Request) {
  try {
    const { actions, context } = await req.json();

  const workflowContext = await applyAiRecommendations(
    actions,
    context as WorkflowContext
  );

  return NextResponse.json({
    success: true,
    context: workflowContext,
  });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
        error instanceof Error
          ? error.message
          : "Workflow failed.",
      },
      {
        status: 500,
      }
    );
  }
}