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
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function PersonalRecordReviewFields({
  form,
  updateField,
}: Props) {
  return (
    <div className="space-y-4">
      <Field
        label="Record Title"
        value={form.recordTitle ?? ""}
        onChange={(v) =>
          updateField("recordTitle", v)
        }
      />

      <Field
        label="Issuing Country"
        value={form.issuingCountry ?? ""}
        onChange={(v) =>
          updateField("issuingCountry", v)
        }
      />

      <Field
        label="Issue Date"
        value={form.issueDate ?? ""}
        onChange={(v) =>
          updateField("issueDate", v)
        }
      />

      <Field
        label="Expiration Date"
        value={form.expirationDate ?? ""}
        onChange={(v) =>
          updateField("expirationDate", v)
        }
      />

      <Field
        label="Identifier"
        value={form.identifier ?? ""}
        onChange={(v) =>
          updateField("identifier", v)
        }
      />
    </div>
  );
}