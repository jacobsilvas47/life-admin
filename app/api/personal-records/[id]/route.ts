import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { createActivity } from "@/lib/activity/create-activity";

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

    const { data: record, error } =
      await supabaseServer
        .from("personal_records")
        .update({
          title: body.title,
          record_type: body.recordType,
          issuing_country: body.issuingCountry,
          issue_date: body.issueDate || null,
          expiration_date:
            body.expirationDate || null,
          identifier: body.identifier,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id, title")
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: "Personal record not found.",
        },
        {
          status: 404,
        }
      );
    }

    await createActivity({
      personalRecordId: record.id,
      activityType:
        "personal_record_updated",
      title: `Updated personal record: ${record.title}`,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error(
      "Update personal record error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update personal record.";

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
     * Verify ownership first.
     * Never delete based only on a client-supplied UUID.
     */
    const {
      data: record,
      error: lookupError,
    } = await supabaseServer
      .from("personal_records")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: "Personal record not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Remove dependent records belonging to this
     * personal record before deleting the record.
     */
    const { error: remindersError } =
      await supabaseServer
        .from("reminders")
        .delete()
        .eq("personal_record_id", record.id)
        .eq("user_id", user.id);

    if (remindersError) {
      throw remindersError;
    }

    const { error: activitiesError } =
      await supabaseServer
        .from("activities")
        .delete()
        .eq("personal_record_id", record.id)
        .eq("user_id", user.id);

    if (activitiesError) {
      throw activitiesError;
    }

    const { error: deleteError } =
      await supabaseServer
        .from("personal_records")
        .delete()
        .eq("id", record.id)
        .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error(
      "Delete personal record error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete personal record.";

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