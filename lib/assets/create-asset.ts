import { supabaseServer } from "@/lib/supabase-server";
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
  const { data: document, error: documentError } = await supabaseServer
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (documentError || !document) {
    throw new Error("Document not found.");
  }

  const { data: asset, error } = await supabaseServer
    .from("assets")
    .insert({
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

  if (error) {
    throw error;
  }

  await supabaseServer
    .from("asset_documents")
    .insert({
      asset_id: asset.id,
      document_id: documentId,
    });

  await createActivity({
    assetId: asset.id,
    documentId,
    activityType: "asset_created",
    title: `Created asset: ${asset.name}`,
    metadata: {
      manufacturer: asset.manufacturer,
      category: asset.category,
    },
  });

  return asset;
}