"use client";

import { useState } from "react";
import { ExtractedDocument } from "@/types/extracted-document";

export default function DocumentReviewForm({
  documentId,
  extractedData,
}: {
  documentId: string;
  extractedData: ExtractedDocument | null;
}) {
  const [form, setForm] = useState<ExtractedDocument>(
    extractedData ?? {
      documentType: "",
      assetName: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      store: "",
      price: null,
      warrantyMonths: null,
      category: "",
      confidence: 0,
    }
  );

  function updateField(field: keyof ExtractedDocument, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "price" || field === "warrantyMonths" || field === "confidence"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  }

  async function saveChanges() {
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        extracted_data: form,
      }),
    });

    const json = await res.json();

    if (!json.success) {
      alert(json.error ?? "Failed to save changes.");
      return false;
    }

    return true;
  }

    async function createAsset() {
    const saved = await saveChanges();

    if (!saved) return;

    alert("Ready to create asset!");
  }

  return (
    <div className="space-y-4">
      <Field label="Asset Name" value={form.assetName} onChange={(v) => updateField("assetName", v)} />
      <Field label="Manufacturer" value={form.manufacturer} onChange={(v) => updateField("manufacturer", v)} />
      <Field label="Model" value={form.model} onChange={(v) => updateField("model", v)} />
      <Field label="Serial Number" value={form.serialNumber} onChange={(v) => updateField("serialNumber", v)} />
      <Field label="Purchase Date" value={form.purchaseDate} onChange={(v) => updateField("purchaseDate", v)} />
      <Field label="Store" value={form.store} onChange={(v) => updateField("store", v)} />
      <Field label="Price" value={form.price?.toString() ?? ""} onChange={(v) => updateField("price", v)} />
      <Field label="Warranty Months" value={form.warrantyMonths?.toString() ?? ""} onChange={(v) => updateField("warrantyMonths", v)} />
      <Field label="Category" value={form.category} onChange={(v) => updateField("category", v)} />

      <p className="text-sm text-gray-500">
        Confidence: {Math.round((form.confidence ?? 0) * 100)}%
      </p>

      <div className="flex gap-3 pt-4">
        <button
          onClick={async () => {
            const success = await saveChanges();

            if (success) {
              alert("Saved!");
            }
          }}
          className="border rounded px-6 py-3 hover:bg-gray-100"
        >
          Save Changes
        </button>

        <button
          onClick={createAsset}
          className="bg-black text-white px-6 py-3 rounded"
        >
          Create Asset
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="mt-1 w-full border rounded p-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}