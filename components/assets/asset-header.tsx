type Asset = {
  name: string;
  category: string | null;
  manufacturer: string | null;
};

export default function AssetHeader({ asset }: { asset: Asset }) {
  return (
    <div className="border rounded-xl p-6 bg-white shadow-sm">
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
  );
}