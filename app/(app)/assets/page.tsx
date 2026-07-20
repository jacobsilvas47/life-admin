import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import AssetsList from "@/components/assets/assets-list";

export default async function AssetsPage() {
  const { data: assets, error } = await supabaseServer
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Assets</h1>
        <p className="text-red-500 mt-4">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">
        Assets
      </h1>

      <p className="text-gray-500 mb-8">
        Track your home, vehicles, appliances, electronics, and more.
      </p>
      <AssetsList assets={assets} />
    </main>
  );
}