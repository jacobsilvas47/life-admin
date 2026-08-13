import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";

type CreateActivityInput = {
  assetId?: string | null;
  personalRecordId?: string | null;
  warrantyId?: string | null;
  documentId?: string | null;

  activityType: string;
  title: string;

  metadata?: Record<string, unknown>;
};

export async function createActivity({
  assetId = null,
  personalRecordId = null,
  warrantyId = null,
  documentId = null,
  activityType,
  title,
  metadata = {},
}: CreateActivityInput) {
  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    console.error(
      "Failed to create activity: no authenticated user."
    );
    return;
  }

  const { error } = await supabaseServer
    .from("activities")
    .insert({
      user_id: user.id,

      asset_id: assetId,
      personal_record_id: personalRecordId,
      warranty_id: warrantyId,
      document_id: documentId,

      activity_type: activityType,
      title,
      metadata,
    });

  if (error) {
    console.error(
      "Failed to create activity:",
      error
    );
  }
}