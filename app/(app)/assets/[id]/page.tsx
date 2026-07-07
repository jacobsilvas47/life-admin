import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

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
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        {asset.name}
      </h1>

      <div className="border rounded-lg p-6 space-y-3">
        <Detail label="Manufacturer" value={asset.manufacturer} />
        <Detail label="Model" value={asset.model} />
        <Detail label="Serial Number" value={asset.serial_number} />
        <Detail label="Purchase Date" value={asset.purchase_date} />
        <Detail label="Category" value={asset.category} />
      </div>
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-medium">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}