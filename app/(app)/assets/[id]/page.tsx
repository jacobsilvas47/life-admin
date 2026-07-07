import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import AssetHeader from "@/components/assets/asset-header";
import AssetOverview from "@/components/assets/asset-overview";
import AssetDocuments from "@/components/assets/asset-documents";

export default async function AssetDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: asset, error } = await supabaseServer
    .from("assets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !asset) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-6">
      <AssetHeader asset={asset} />

      <AssetOverview asset={asset} />

      <AssetDocuments assetId={asset.id} />
    </main>
  );
}