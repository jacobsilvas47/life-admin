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
        issue_date: body.issueDate,
        expiration_date: body.expirationDate,
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
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ??
          "Failed to update personal record.",
      },
      {
        status: 500,
      }
    );
  }
}