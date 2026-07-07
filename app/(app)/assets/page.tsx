import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

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

      {assets.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          No assets yet.
        </div>
      ) : (
        <div className="space-y-4">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              href={`/assets/${asset.id}`}
              className="block border rounded-lg p-5 hover:bg-gray-50 transition"
            >
              <h2 className="text-xl font-semibold">
                {asset.name}
              </h2>

              <p className="text-gray-600 mt-1">
                {asset.manufacturer || "Unknown Manufacturer"}
              </p>

              <div className="mt-3 flex gap-6 text-sm text-gray-500">
                <span>Category: {asset.category || "—"}</span>
                <span>Model: {asset.model || "—"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}