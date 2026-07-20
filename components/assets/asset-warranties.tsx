type Warranty = {
  id: string;
  provider: string | null;
  warranty_type: string | null;
  purchase_date: string | null;
  expiration_date: string | null;
};

export default function AssetWarranties({
  warranties,
}: {
  warranties: Warranty[];
}) {
  if (!warranties.length) {
    return null;
  }

  return (
    <section className="rounded-xl border p-6 bg-white">
      <h2 className="text-2xl font-semibold mb-6">
        Warranty
      </h2>

      <div className="space-y-6">
        {warranties.map((warranty) => (
          <div
            key={warranty.id}
            className="border rounded-lg p-4"
          >
            <div className="grid grid-cols-2 gap-y-3">
              <span className="text-gray-500">Provider</span>
              <span>{warranty.provider ?? "-"}</span>

              <span className="text-gray-500">Type</span>
              <span>{warranty.warranty_type ?? "-"}</span>

              <span className="text-gray-500">Purchase Date</span>
              <span>{warranty.purchase_date ?? "-"}</span>

              <span className="text-gray-500">Expiration</span>
              <span>{warranty.expiration_date ?? "-"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}