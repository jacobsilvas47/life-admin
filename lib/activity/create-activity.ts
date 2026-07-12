import { supabaseServer } from "@/lib/supabase-server";

type CreateActivityInput = {
  assetId?: string | null;
  personalRecordId?: string | null;
  documentId?: string | null;

  activityType: string;
  title: string;

  metadata?: Record<string, unknown>;
};

export async function createActivity({
  assetId = null,
  personalRecordId = null,
  documentId = null,
  activityType,
  title,
  metadata = {},
}: CreateActivityInput) {
  const { error } = await supabaseServer.from("activities").insert({
  asset_id: assetId,
  personal_record_id: personalRecordId,
  document_id: documentId,

  activity_type: activityType,
  title,
  metadata,
});

  if (error) {
    console.error("Failed to create activity:", error);
  }
}