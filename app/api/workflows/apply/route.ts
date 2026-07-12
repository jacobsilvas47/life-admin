import { NextResponse } from "next/server";
import { applyAiRecommendations } from "@/lib/workflows/apply-ai-recommendations";
import { WorkflowContext } from "@/lib/workflows/types";

export async function POST(req: Request) {
  try {
    const { actions, context } = await req.json();

    await applyAiRecommendations(
      actions,
      context as WorkflowContext
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}