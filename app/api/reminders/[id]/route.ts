import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { createActivity } from "@/lib/activity/create-activity";
import { getEntitlements } from "@/lib/subscriptions/get-entitlements";

async function getAuthenticatedUser() {
  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
    error,
  } = await authSupabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
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

    const { id } = await params;
    const body = await request.json();

    const entitlements = await getEntitlements();

    const notificationOffsets =
      entitlements.canUseAdvancedReminders
        ? body.notificationOffsets
        : [7];

    const { data: reminder, error } =
      await supabaseServer
        .from("reminders")
        .update({
          title: body.title,
          due_date: body.dueDate,
          completed: body.completed,
          notification_offsets:
            notificationOffsets,
          notes: body.notes,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select(`
          id,
          title,
          asset_id,
          personal_record_id,
          warranty_id
        `)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!reminder) {
      return NextResponse.json(
        {
          success: false,
          error: "Reminder not found.",
        },
        {
          status: 404,
        }
      );
    }

    await createActivity({
      assetId: reminder.asset_id,
      personalRecordId:
        reminder.personal_record_id,
      warrantyId: reminder.warranty_id,
      activityType: "reminder_updated",
      title: `Updated reminder: ${reminder.title}`,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error(
      "Update reminder error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update reminder.";

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

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
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

    const { id } = await params;

    /*
     * Verify that the reminder belongs to the
     * authenticated user before deleting it.
     */
    const {
      data: reminder,
      error: lookupError,
    } = await supabaseServer
      .from("reminders")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (!reminder) {
      return NextResponse.json(
        {
          success: false,
          error: "Reminder not found.",
        },
        {
          status: 404,
        }
      );
    }

    const { error: deleteError } =
      await supabaseServer
        .from("reminders")
        .delete()
        .eq("id", reminder.id)
        .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error(
      "Delete reminder error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete reminder.";

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