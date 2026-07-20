"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Asset = {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  category: string | null;
};

export default function AssetEditForm({
  asset,
}: {
  asset: Asset;
}) {
  const router = useRouter();

  const [name, setName] = useState(asset.name);
  const [manufacturer, setManufacturer] = useState(
    asset.manufacturer ?? ""
  );
  const [model, setModel] = useState(asset.model ?? "");
  const [serialNumber, setSerialNumber] = useState(
    asset.serial_number ?? ""
  );
  const [purchaseDate, setPurchaseDate] = useState(
    asset.purchase_date ?? ""
  );
  const [category, setCategory] = useState(
    asset.category ?? ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          manufacturer: manufacturer || null,
          model: model || null,
          serialNumber: serialNumber || null,
          purchaseDate: purchaseDate || null,
          category: category || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update asset.");
      }

      router.push(`/assets/${asset.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update asset."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      <Field
        label="Asset Name"
        value={name}
        onChange={setName}
        required
      />

      <Field
        label="Manufacturer"
        value={manufacturer}
        onChange={setManufacturer}
      />

      <Field
        label="Model"
        value={model}
        onChange={setModel}
      />

      <Field
        label="Serial Number"
        value={serialNumber}
        onChange={setSerialNumber}
      />

      <Field
        label="Purchase Date"
        value={purchaseDate}
        onChange={setPurchaseDate}
        type="date"
      />

      <Field
        label="Category"
        value={category}
        onChange={setCategory}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(`/assets/${asset.id}`)}
          className="rounded-lg border px-4 py-2 font-medium hover:bg-muted"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving || !name.trim()}
          className="rounded-lg bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}