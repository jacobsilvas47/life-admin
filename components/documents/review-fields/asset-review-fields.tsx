import { ExtractedDocument } from "@/types/extracted-document";

type Props = {
  form: ExtractedDocument;
  updateField: (
    field: keyof ExtractedDocument,
    value: string
  ) => void;
};

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
      <span className="text-sm font-medium">
        {label}
      </span>

      <input
        className="mt-1 w-full rounded border p-2"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </label>
  );
}

export default function AssetReviewFields({
  form,
  updateField,
}: Props) {
  return (
    <div className="space-y-4">
      <Field
        label="Asset Name"
        value={form.assetName}
        onChange={(v) =>
          updateField("assetName", v)
        }
      />

      <Field
        label="Manufacturer"
        value={form.manufacturer}
        onChange={(v) =>
          updateField("manufacturer", v)
        }
      />

      <Field
        label="Model"
        value={form.model}
        onChange={(v) =>
          updateField("model", v)
        }
      />

      <Field
        label="Serial Number"
        value={form.serialNumber ?? ""}
        onChange={(v) =>
          updateField("serialNumber", v)
        }
      />

      <Field
        label="Purchase Date"
        value={form.purchaseDate}
        onChange={(v) =>
          updateField("purchaseDate", v)
        }
      />

      <Field
        label="Store"
        value={form.store}
        onChange={(v) =>
          updateField("store", v)
        }
      />

      <Field
        label="Price"
        value={form.price?.toString() ?? ""}
        onChange={(v) =>
          updateField("price", v)
        }
      />

      <Field
        label="Warranty Months"
        value={form.warrantyMonths?.toString() ?? ""}
        onChange={(v) =>
          updateField("warrantyMonths", v)
        }
      />

      <Field
        label="Category"
        value={form.category}
        onChange={(v) =>
          updateField("category", v)
        }
      />
    </div>
  );
}