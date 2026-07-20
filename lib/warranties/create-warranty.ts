import { supabaseServer } from "@/lib/supabase-server";
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
  const { data: warranty, error } = await supabaseServer
    .from("warranties")
    .insert({
      asset_id: assetId,
      document_id: documentId,

      provider,
      warranty_type: warrantyType,

      purchase_date: purchaseDate,
      start_date: startDate,
      expiration_date: expirationDate,

      duration_months: durationMonths,

      notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await createActivity({
    assetId,
    warrantyId: warranty.id,
    documentId,

    activityType: "warranty_created",
    title: "Warranty added",
  });

  return warranty;
}