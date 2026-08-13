import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { createActivity } from "@/lib/activity/create-activity";

type CreateWarrantyInput = {
  assetId: string;
  documentId: string;

  provider?: string | null;
  warrantyType?: string | null;

  purchaseDate?: string | null;
  startDate?: string | null;
  expirationDate?: string | null;

  durationMonths?: number | null;

  notes?: string | null;
};

export async function createWarranty({
  assetId,
  documentId,
  provider,
  warrantyType,
  purchaseDate,
  startDate,
  expirationDate,
  durationMonths,
  notes,
}: CreateWarrantyInput) {
  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      "You must be signed in to create a warranty."
    );
  }

  /*
   * Verify that the asset belongs to the
   * authenticated user.
   */
  const {
    data: asset,
    error: assetError,
  } = await supabaseServer
    .from("assets")
    .select("id")
    .eq("id", assetId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (assetError) {
    throw assetError;
  }

  if (!asset) {
    throw new Error("Asset not found.");
  }

  /*
   * Verify that the source document also
   * belongs to the authenticated user.
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
   * Both parent records are confirmed to
   * belong to this user. Create the warranty.
   */
  const {
    data: warranty,
    error: warrantyError,
  } = await supabaseServer
    .from("warranties")
    .insert({
      asset_id: asset.id,
      document_id: document.id,

      provider,
      warranty_type: warrantyType,

      purchase_date: purchaseDate || null,
      start_date: startDate || null,
      expiration_date:
        expirationDate || null,

      duration_months: durationMonths,

      notes,
    })
    .select()
    .single();

  if (warrantyError) {
    throw warrantyError;
  }

  await createActivity({
    assetId: asset.id,
    warrantyId: warranty.id,
    documentId: document.id,

    activityType: "warranty_created",
    title: "Warranty added",
  });

  return warranty;
}