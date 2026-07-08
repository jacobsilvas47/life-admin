import { supabaseServer } from "@/lib/supabase-server";

type CreateActivityInput = {
  assetId?: string | null;
  documentId?: string | null;
  activityType: string;
  title: string;
  metadata?: Record<string, unknown>;
};

export async function createActivity({
  assetId = null,
  documentId = null,
  activityType,
  title,
  metadata = {},
}: CreateActivityInput) {
  const { error } = await supabaseServer.from("activities").insert({
    asset_id: assetId,
    document_id: documentId,
    activity_type: activityType,
    title,
    metadata,
  });

  if (error) {
    console.error("Failed to create activity:", error);
  }
}