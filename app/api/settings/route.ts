import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing settings ID.",
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } = await supabaseServer
      .from("user_settings")
      .update({
        date_format: body.dateFormat,
        timezone: body.timezone,
        email_notifications:
          body.emailNotifications,
        default_notification_offsets:
          body.defaultNotificationOffsets,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (error: unknown) {
    console.error("Update settings error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update settings.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}