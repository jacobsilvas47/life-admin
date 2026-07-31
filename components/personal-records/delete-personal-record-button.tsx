"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmDialog from "@/components/ui/confirm-dialog";

type DeletePersonalRecordButtonProps = {
  recordId: string;
  recordTitle: string;
};

export default function DeletePersonalRecordButton({
  recordId,
  recordTitle,
}: DeletePersonalRecordButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/personal-records/${recordId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to delete personal record."
        );
      }

      setIsOpen(false);

      router.push("/personal-records");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete personal record."
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
        title="Delete Personal Record"
        description={`Are you sure you want to delete "${recordTitle}"?

        This will remove the personal record from Life Admin.

        The original uploaded document will remain available.`}
        confirmLabel="Delete Personal Record"
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