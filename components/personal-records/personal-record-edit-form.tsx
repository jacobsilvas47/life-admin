"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type PersonalRecord = {
  id: string;
  title: string;
  record_type: string;
  issuing_country: string | null;
  issue_date: string | null;
  expiration_date: string | null;
  identifier: string | null;
};

export default function PersonalRecordEditForm({
  record,
}: {
  record: PersonalRecord;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(record.title);
  const [recordType, setRecordType] = useState(record.record_type);
  const [issuingCountry, setIssuingCountry] = useState(
    record.issuing_country ?? ""
  );
  const [issueDate, setIssueDate] = useState(
    record.issue_date ?? ""
  );
  const [expirationDate, setExpirationDate] = useState(
    record.expiration_date ?? ""
  );
  const [identifier, setIdentifier] = useState(
    record.identifier ?? ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/personal-records/${record.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            recordType,
            issuingCountry,
            issueDate,
            expirationDate,
            identifier,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Failed to update personal record."
        );
      }

      router.push(`/personal-records/${record.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update personal record."
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
        label="Title"
        value={title}
        onChange={setTitle}
        required
      />

      <Field
        label="Record Type"
        value={recordType}
        onChange={setRecordType}
      />

      <Field
        label="Issuing Country"
        value={issuingCountry}
        onChange={setIssuingCountry}
      />

      <Field
        label="Issue Date"
        value={issueDate}
        onChange={setIssueDate}
        type="date"
      />

      <Field
        label="Expiration Date"
        value={expirationDate}
        onChange={setExpirationDate}
        type="date"
      />

      <Field
        label="Identifier"
        value={identifier}
        onChange={setIdentifier}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.push(`/personal-records/${record.id}`)
          }
          className="rounded-lg border px-4 py-2"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-black px-4 py-2 text-white"
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
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border px-3 py-2"
      />
    </label>
  );
}