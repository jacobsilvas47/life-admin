import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

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

    const { data: document, error: documentError } =
      await supabaseServer
        .from("documents")
        .select("id, file_name, file_path")
        .eq("id", id)
        .single();

    if (documentError || !document) {
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

    const [
      assetLinksResult,
      personalRecordsResult,
      warrantiesResult,
    ] = await Promise.all([
      supabaseServer
        .from("asset_documents")
        .select("asset_id")
        .eq("document_id", id)
        .limit(1),

      supabaseServer
        .from("personal_records")
        .select("id")
        .eq("document_id", id)
        .limit(1),

      supabaseServer
        .from("warranties")
        .select("id")
        .eq("document_id", id)
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

    // Remove activities associated directly with this document.
    const { error: activitiesError } = await supabaseServer
      .from("activities")
      .delete()
      .eq("document_id", id);

    if (activitiesError) {
      throw activitiesError;
    }

    // Remove the file from Supabase Storage.
    const { error: storageError } = await supabaseServer.storage
      .from("documents")
      .remove([document.file_path]);

    if (storageError) {
      throw storageError;
    }

    // Remove the database row last.
    const { error: deleteError } = await supabaseServer
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
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
            : "Failed to delete document.",
      },
      {
        status: 500,
      }
    );
  }
}