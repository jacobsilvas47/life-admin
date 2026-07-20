import SectionCard from "@/components/ui/section-card";

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
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <span className="font-medium">
        {value || "—"}
      </span>
    </div>
  );
}

export default function AssetOverview({
  asset,
}: {
  asset: Asset;
}) {
  return (
    <SectionCard
      title="Overview"
      description="Basic information about this asset."
    >
      <Row label="Manufacturer" value={asset.manufacturer} />
      <Row label="Model" value={asset.model} />
      <Row label="Serial Number" value={asset.serial_number} />
      <Row label="Purchase Date" value={asset.purchase_date} />
      <Row label="Category" value={asset.category} />
    </SectionCard>
  );
}