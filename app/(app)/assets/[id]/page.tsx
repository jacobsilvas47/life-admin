import { notFound } from "next/navigation";

import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
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

  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: asset, error } =
    await supabaseServer
      .from("assets")
      .select(`
        *,
        warranties (*)
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

  if (error || !asset) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <BackButton
        fallbackHref="/assets"
        label="Back to Assets"
      />

      <AssetHeader asset={asset} />

      <AssetOverview asset={asset} />

      <AssetWarranties
        warranties={asset.warranties ?? []}
      />

      <AssetDocuments assetId={asset.id} />
    </main>
  );
}