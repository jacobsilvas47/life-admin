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

    const { data: asset, error } =
      await supabaseServer
        .from("assets")
        .update({
          name: body.name,
          manufacturer: body.manufacturer,
          model: body.model,
          serial_number: body.serialNumber,
          purchase_date: body.purchaseDate,
          category: body.category,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id, name")
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          error: "Asset not found.",
        },
        {
          status: 404,
        }
      );
    }

    await createActivity({
      assetId: asset.id,
      activityType: "asset_updated",
      title: `Updated asset: ${asset.name}`,
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
     * Verify ownership BEFORE deleting any related data.
     *
     * This is critical because the dependent tables below
     * don't all have their own user_id column.
     */
    const {
      data: asset,
      error: assetLookupError,
    } = await supabaseServer
      .from("assets")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (assetLookupError) {
      throw assetLookupError;
    }

    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          error: "Asset not found.",
        },
        {
          status: 404,
        }
      );
    }

    // The asset is confirmed to belong to this user.
    // We can now safely remove its dependent records.

    const { error: assetDocumentsError } =
      await supabaseServer
        .from("asset_documents")
        .delete()
        .eq("asset_id", asset.id);

    if (assetDocumentsError) {
      throw assetDocumentsError;
    }

    const { error: remindersError } =
      await supabaseServer
        .from("reminders")
        .delete()
        .eq("asset_id", asset.id)
        .eq("user_id", user.id);

    if (remindersError) {
      throw remindersError;
    }

    const { error: activitiesError } =
      await supabaseServer
        .from("activities")
        .delete()
        .eq("asset_id", asset.id)
        .eq("user_id", user.id);

    if (activitiesError) {
      throw activitiesError;
    }

    const { error: warrantiesError } =
      await supabaseServer
        .from("warranties")
        .delete()
        .eq("asset_id", asset.id);

    if (warrantiesError) {
      throw warrantiesError;
    }

    const { error: assetError } =
      await supabaseServer
        .from("assets")
        .delete()
        .eq("id", asset.id)
        .eq("user_id", user.id);

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