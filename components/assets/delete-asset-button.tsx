"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteAssetButtonProps = {
  assetId: string;
  assetName: string;
};

export default function DeleteAssetButton({
  assetId,
  assetName,
}: DeleteAssetButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${assetName}"?\n\nThis will also remove its warranties, reminders, activities, and document links. The original uploaded documents will remain available.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete asset.");
      }

      router.push("/assets");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete asset."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "🗑 Delete"}
      </button>

      {error && (
        <p className="max-w-xs text-right text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}