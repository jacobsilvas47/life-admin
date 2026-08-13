import { NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { getUserSettings } from "@/lib/settings/get-user-settings";
import { sendReminderEmail } from "@/lib/email/send-reminder-email";

export async function GET() {
  try {
    const authSupabase =
      await createAuthServerClient();

    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user?.email) {
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

    const settings =
      await getUserSettings();

    const result = await sendReminderEmail({
      recipient: user.email,
      title: "Life Admin Test Reminder",
      dueDate: "2026-09-07",
      notificationOffset: 30,
      dateFormat: settings.date_format,
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