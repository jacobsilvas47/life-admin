"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmDialog from "@/components/ui/confirm-dialog";

type DeleteAssetButtonProps = {
  assetId: string;
  assetName: string;
};

export default function DeleteAssetButton({
  assetId,
  assetName,
}: DeleteAssetButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to delete asset."
        );
      }

      setIsOpen(false);
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
    <>
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
          disabled={isDeleting}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          🗑 Delete
        </button>

        {error && (
          <p className="max-w-xs text-right text-sm text-red-500">
            {error}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={isOpen}
        title="Delete Asset"
        description={`Are you sure you want to delete "${assetName}"?

This will also remove its warranties, reminders, activities, and document links.

The original uploaded documents will remain available.`}
        confirmLabel="Delete Asset"
        isLoading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setIsOpen(false);
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}