import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { createActivity } from "@/lib/activity/create-activity";

type CreateAssetInput = {
  documentId: string;
  assetName: string;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  category?: string | null;
  notes?: string | null;
};

export async function createAsset({
  documentId,
  assetName,
  manufacturer,
  model,
  serialNumber,
  purchaseDate,
  category,
  notes,
}: CreateAssetInput) {
  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      "You must be signed in to create an asset."
    );
  }

  /*
   * Verify that the source document belongs
   * to the authenticated user.
   */
  const {
    data: document,
    error: documentError,
  } = await supabaseServer
    .from("documents")
    .select("id")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (documentError) {
    throw documentError;
  }

  if (!document) {
    throw new Error("Document not found.");
  }

  /*
   * Create the asset under the authenticated
   * user's account.
   */
  const { data: asset, error: assetError } =
    await supabaseServer
      .from("assets")
      .insert({
        user_id: user.id,
        name: assetName,
        manufacturer,
        model,
        serial_number: serialNumber,
        purchase_date: purchaseDate || null,
        category,
        notes,
      })
      .select()
      .single();

  if (assetError) {
    throw assetError;
  }

  /*
   * Link the user's document to the new asset.
   */
  const { error: linkError } =
    await supabaseServer
      .from("asset_documents")
      .insert({
        asset_id: asset.id,
        document_id: document.id,
      });

  if (linkError) {
    throw linkError;
  }

  await createActivity({
    assetId: asset.id,
    documentId: document.id,
    activityType: "asset_created",
    title: `Created asset: ${asset.name}`,
    metadata: {
      manufacturer: asset.manufacturer,
      category: asset.category,
    },
  });

  return asset;
}