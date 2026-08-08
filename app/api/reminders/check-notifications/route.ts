import { NextRequest, NextResponse } from "next/server";

import { processDueNotifications } from "@/lib/reminders/process-due-notifications";

export async function GET(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization");

    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error(
        "CRON_SECRET is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      authorization !== `Bearer ${cronSecret}`
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const result =
      await processDueNotifications();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error(
      "Process reminder notifications error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process notifications.",
      },
      {
        status: 500,
      }
    );
  }
}