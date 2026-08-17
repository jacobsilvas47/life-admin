import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { getEntitlements } from "@/lib/subscriptions/get-entitlements";

export async function PATCH(request: Request) {
  try {
    const authSupabase =
      await createAuthServerClient();

    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
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

    const body = await request.json();

    /*
     * Never trust the client to enforce
     * subscription entitlements.
     */
    const entitlements =
      await getEntitlements();

    const defaultNotificationOffsets =
      entitlements.canUseAdvancedReminders
        ? body.defaultNotificationOffsets
        : [7];

    const { data, error } =
      await supabaseServer
        .from("user_settings")
        .update({
          date_format: body.dateFormat,
          timezone: body.timezone,
          email_notifications:
            body.emailNotifications,
          default_notification_offsets:
            defaultNotificationOffsets,
          updated_at:
            new Date().toISOString(),
        })
        .eq("user_id", user.id)
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
    console.error(
      "Update settings error:",
      error
    );

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