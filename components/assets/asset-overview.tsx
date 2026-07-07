type Asset = {
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  category: string | null;
};

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex justify-between py-3 border-b last:border-b-0">
      <span className="font-medium text-gray-600">
        {label}
      </span>

      <span>{value || "—"}</span>
    </div>
  );
}

export default function AssetOverview({
  asset,
}: {
  asset: Asset;
}) {
  return (
    <section className="border rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        Overview
      </h2>

      <Row label="Manufacturer" value={asset.manufacturer} />
      <Row label="Model" value={asset.model} />
      <Row label="Serial Number" value={asset.serial_number} />
      <Row label="Purchase Date" value={asset.purchase_date} />
      <Row label="Category" value={asset.category} />
    </section>
  );
}