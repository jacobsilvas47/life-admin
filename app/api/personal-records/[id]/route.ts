import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createActivity } from "@/lib/activity/create-activity";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const { error } = await supabaseServer
      .from("personal_records")
      .update({
        title: body.title,
        record_type: body.recordType,
        issuing_country: body.issuingCountry,
        issue_date: body.issueDate || null,
        expiration_date: body.expirationDate || null,
        identifier: body.identifier,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    await createActivity({
      personalRecordId: id,
      activityType: "personal_record_updated",
      title: `Updated personal record: ${body.title}`,
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
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseServer
      .from("personal_records")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
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