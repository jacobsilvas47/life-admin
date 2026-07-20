"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/ui/search-bar";

type Asset = {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  category: string | null;
};

export default function AssetsList({
  assets,
}: {
  assets: Asset[];
}) {
  const [search, setSearch] = useState("");

  const filteredAssets = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return assets;
    }

    return assets.filter((asset) =>
      [
        asset.name,
        asset.manufacturer,
        asset.model,
        asset.category,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(query)
        )
    );
  }, [assets, search]);

  return (
    <>
        <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, manufacturer, model, or category..."
        />

      {filteredAssets.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-gray-500">
          No matching assets found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssets.map((asset) => (
            <Link
              key={asset.id}
              href={`/assets/${asset.id}`}
              className="block rounded-lg border p-5 transition hover:bg-gray-50"
            >
              <h2 className="text-xl font-semibold">
                {asset.name}
              </h2>

              <p className="mt-1 text-gray-600">
                {asset.manufacturer || "Unknown Manufacturer"}
              </p>

              <div className="mt-3 flex gap-6 text-sm text-gray-500">
                <span>
                  Category: {asset.category || "—"}
                </span>

                <span>
                  Model: {asset.model || "—"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}