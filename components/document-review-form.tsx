"use client";

import { useState } from "react";
import { ExtractedDocument } from "@/types/extracted-document";
import SuggestedActions from "@/components/documents/suggested-actions";

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
      documentCategory: "",
      recordType: "",
      recordTitle: "",
      issuingCountry: "",
      issueDate: "",
      expirationDate: "",
      identifier: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      store: "",
      price: null,
      warrantyMonths: null,
      category: "",
      confidence: 0,
      suggestedActions: [],
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
    const res = await fetch(`/api/process-document/documents/${documentId}`, {
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

    console.log("Suggested Actions:", form.suggestedActions);
    console.log("Context:", {
      documentId,
      recordType: form.recordType,
      recordTitle: form.recordTitle,
    });

    const res = await fetch("/api/workflows/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      actions: form.suggestedActions,
      context: {
        documentId,

        assetName: form.assetName,
        manufacturer: form.manufacturer,
        model: form.model,
        serialNumber: form.serialNumber,
        purchaseDate: form.purchaseDate,
        category: form.category,
        recordType: form.recordType,
        recordTitle: form.recordTitle,
        issuingCountry: form.issuingCountry,
        issueDate: form.issueDate,
        expirationDate: form.expirationDate,
        identifier: form.identifier,

        suggestedActions: form.suggestedActions,
      },
    }),
  });

  const json = await res.json();

  console.log(json);

  if (!json.success) {
    alert(json.error ?? "Workflow failed.");
    return;
  }

  alert("Workflow completed!");
}

const isPersonalRecord =
  form.recordType && form.recordType.length > 0;

const primaryButtonLabel = isPersonalRecord
  ? "Create Personal Record"
  : "Create Asset";

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-gray-50 mb-6">
        <h2 className="text-lg font-semibold">
          AI Analysis
        </h2>

        <div className="mt-3 space-y-2">
          <p>
            <span className="font-medium">Document Type:</span>{" "}
            {form.documentType || "Unknown"}
          </p>

          <p>
            <span className="font-medium">Category:</span>{" "}
            {form.documentCategory || "Unknown"}
          </p>

          {form.recordType && (
            <p>
              <span className="font-medium">Record Type:</span>{" "}
              {form.recordType.replaceAll("_", " ")}
            </p>
          )}

          {form.documentCategory === "personal_record" && (
            <div className="mt-4 space-y-2 border-t pt-4">
              <p>
                <span className="font-medium">Record Title:</span>{" "}
                {form.recordTitle || "Unknown"}
              </p>

              <p>
                <span className="font-medium">Issuing Country:</span>{" "}
                {form.issuingCountry || "Unknown"}
              </p>

              <p>
                <span className="font-medium">Issue Date:</span>{" "}
                {form.issueDate || "Unknown"}
              </p>

              <p>
                <span className="font-medium">Expiration Date:</span>{" "}
                {form.expirationDate || "Unknown"}
              </p>

              <p>
                <span className="font-medium">Identifier:</span>{" "}
                {form.identifier || "Unknown"}
              </p>
            </div>
          )}

          <p>
            <span className="font-medium">Confidence:</span>{" "}
            {Math.round((form.confidence ?? 0) * 100)}%
          </p>
        </div>
      </div>

      <SuggestedActions
        actions={form.suggestedActions ?? []}
      />
      
      <Field label="Asset Name" value={form.assetName} onChange={(v) => updateField("assetName", v)} />
      <Field label="Manufacturer" value={form.manufacturer} onChange={(v) => updateField("manufacturer", v)} />
      <Field label="Model" value={form.model} onChange={(v) => updateField("model", v)} />
      <Field label="Serial Number" value={form.serialNumber ?? ""} onChange={(v) => updateField("serialNumber", v)} />
      <Field label="Purchase Date" value={form.purchaseDate} onChange={(v) => updateField("purchaseDate", v)} />
      <Field label="Store" value={form.store} onChange={(v) => updateField("store", v)} />
      <Field label="Price" value={form.price?.toString() ?? ""} onChange={(v) => updateField("price", v)} />
      <Field label="Warranty Months" value={form.warrantyMonths?.toString() ?? ""} onChange={(v) => updateField("warrantyMonths", v)} />
      <Field label="Category" value={form.category} onChange={(v) => updateField("category", v)} />

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
          {primaryButtonLabel}
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