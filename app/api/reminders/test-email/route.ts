import { NextResponse } from "next/server";

import { sendReminderEmail } from "@/lib/email/send-reminder-email";

export async function GET() {
  try {
    const result = await sendReminderEmail({
      title: "Life Admin Test Reminder",
      dueDate: "2026-09-07",
      notificationOffset: 30,
      notes:
        "This is a test of the Life Admin reminder system.",
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: unknown) {
    console.error(
      "Test reminder email error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send test email.",
      },
      {
        status: 500,
      }
    );
  }
}