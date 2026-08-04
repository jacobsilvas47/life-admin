"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmDialog from "@/components/ui/confirm-dialog";

type DeleteReminderButtonProps = {
  reminderId: string;
  reminderTitle: string;
};

export default function DeleteReminderButton({
  reminderId,
  reminderTitle,
}: DeleteReminderButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/reminders/${reminderId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ?? "Failed to delete reminder."
        );
      }

      setIsOpen(false);

      router.push("/reminders");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete reminder."
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
        title="Delete Reminder"
        description={`Are you sure you want to permanently delete "${reminderTitle}"?

This reminder will be removed from Life Admin. The linked asset, personal record, warranty, and documents will remain available.`}
        confirmLabel="Delete Reminder"
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