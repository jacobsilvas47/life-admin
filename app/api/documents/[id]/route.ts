import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";

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
     * Verify ownership BEFORE touching relationships,
     * activities, Storage, or the document itself.
     */
    const {
      data: document,
      error: documentError,
    } = await supabaseServer
      .from("documents")
      .select("id, file_name, file_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (documentError) {
      throw documentError;
    }

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          error: "Document not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Ownership has now been verified.
     * Check whether this document is still linked.
     */
    const [
      assetLinksResult,
      personalRecordsResult,
      warrantiesResult,
    ] = await Promise.all([
      supabaseServer
        .from("asset_documents")
        .select("asset_id")
        .eq("document_id", document.id)
        .limit(1),

      supabaseServer
        .from("personal_records")
        .select("id")
        .eq("document_id", document.id)
        .eq("user_id", user.id)
        .limit(1),

      supabaseServer
        .from("warranties")
        .select("id")
        .eq("document_id", document.id)
        .limit(1),
    ]);

    if (assetLinksResult.error) {
      throw assetLinksResult.error;
    }

    if (personalRecordsResult.error) {
      throw personalRecordsResult.error;
    }

    if (warrantiesResult.error) {
      throw warrantiesResult.error;
    }

    const isLinked =
      (assetLinksResult.data?.length ?? 0) > 0 ||
      (personalRecordsResult.data?.length ?? 0) > 0 ||
      (warrantiesResult.data?.length ?? 0) > 0;

    if (isLinked) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This document is linked to an asset, personal record, or warranty. Remove those links before deleting it.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Remove activities associated directly
     * with this user's document.
     */
    const { error: activitiesError } =
      await supabaseServer
        .from("activities")
        .delete()
        .eq("document_id", document.id)
        .eq("user_id", user.id);

    if (activitiesError) {
      throw activitiesError;
    }

    /*
     * Remove the physical file from Storage.
     *
     * This happens only AFTER ownership has
     * been confirmed.
     */
    const { error: storageError } =
      await supabaseServer.storage
        .from("documents")
        .remove([document.file_path]);

    if (storageError) {
      throw storageError;
    }

    /*
     * Finally remove the database row.
     */
    const { error: deleteError } =
      await supabaseServer
        .from("documents")
        .delete()
        .eq("id", document.id)
        .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error(
      "Delete document error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete document.",
      },
      {
        status: 500,
      }
    );
  }
}