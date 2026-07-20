import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import BackButton from "@/components/ui/back-button";
import AssetEditForm from "@/components/assets/asset-edit-form";

export default async function EditAssetPage({
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
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <BackButton
        fallbackHref={`/assets/${asset.id}`}
        label="Back to Asset"
      />

      <div>
        <h1 className="text-3xl font-bold">Edit Asset</h1>

        <p className="mt-2 text-muted-foreground">
          Update the information stored for {asset.name}.
        </p>
      </div>

      <AssetEditForm asset={asset} />
    </main>
  );
}