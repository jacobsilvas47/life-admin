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
      .from("assets")
      .update({
        name: body.name,
        manufacturer: body.manufacturer,
        model: body.model,
        serial_number: body.serialNumber,
        purchase_date: body.purchaseDate,
        category: body.category,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    await createActivity({
      assetId: id,
      activityType: "asset_updated",
      title: `Updated asset: ${body.name}`,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
        error instanceof Error
    ? error.message
    : "Failed to update asset.",
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
    const { id } = await params;

    // Remove relationships and dependent records first.
    // The uploaded documents themselves are preserved.
    const { error: assetDocumentsError } = await supabaseServer
      .from("asset_documents")
      .delete()
      .eq("asset_id", id);

    if (assetDocumentsError) {
      throw assetDocumentsError;
    }

    const { error: remindersError } = await supabaseServer
      .from("reminders")
      .delete()
      .eq("asset_id", id);

    if (remindersError) {
      throw remindersError;
    }

    const { error: activitiesError } = await supabaseServer
      .from("activities")
      .delete()
      .eq("asset_id", id);

    if (activitiesError) {
      throw activitiesError;
    }

    const { error: warrantiesError } = await supabaseServer
      .from("warranties")
      .delete()
      .eq("asset_id", id);

    if (warrantiesError) {
      throw warrantiesError;
    }

    const { error: assetError } = await supabaseServer
      .from("assets")
      .delete()
      .eq("id", id);

    if (assetError) {
      throw assetError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete asset.",
      },
      {
        status: 500,
      }
    );
  }
}