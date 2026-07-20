import Link from "next/link";
import DeleteAssetButton from "@/components/assets/delete-asset-button";

type Asset = {
  id: string;
  name: string;
  category: string | null;
  manufacturer: string | null;
};

export default function AssetHeader({
  asset,
}: {
  asset: Asset;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {asset.name}
          </h1>

          <p className="mt-2 text-gray-500">
            {asset.category || "Uncategorized"}
          </p>

          {asset.manufacturer && (
            <p className="mt-4 text-lg font-medium">
              {asset.manufacturer}
            </p>
          )}
        </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={`/assets/${asset.id}/edit`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
            >
              ✏️ Edit
            </Link>

            <DeleteAssetButton
              assetId={asset.id}
              assetName={asset.name}
            />
          </div>
      </div>
    </div>
  );
}