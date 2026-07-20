import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import AssetHeader from "@/components/assets/asset-header";
import AssetOverview from "@/components/assets/asset-overview";
import AssetDocuments from "@/components/assets/asset-documents";
import AssetWarranties from "@/components/assets/asset-warranties";
import BackButton from "@/components/ui/back-button";

export default async function AssetDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: asset, error } = await supabaseServer
    .from("assets")
    .select(`
      *,
      warranties (*)
    `)
    .eq("id", id)
    .single();

  if (error || !asset) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-6">
      <BackButton
        fallbackHref="/assets"
        label="Back to Assets"
      />
      
      <AssetHeader asset={asset} />

      <AssetOverview asset={asset} />

      <AssetWarranties warranties={asset.warranties ?? []} />

      <AssetDocuments assetId={asset.id} />
    </main>
  );
}