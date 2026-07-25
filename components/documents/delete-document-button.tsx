"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";

type DeleteDocumentButtonProps = {
  documentId: string;
  fileName: string;
};

export default function DeleteDocumentButton({
  documentId,
  fileName,
}: DeleteDocumentButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to delete document."
        );
      }

      setIsOpen(false);
      toast.success("Document deleted successfully.");

      router.push("/documents");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete document."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        disabled={isDeleting}
        onClick={() => setIsOpen(true)}
      >
        Delete
      </Button>

      <ConfirmDialog
        open={isOpen}
        title="Delete Document"
        description={`Are you sure you want to permanently delete "${fileName}"?

The file will be removed from storage and cannot be recovered.

Documents linked to an asset, personal record, or warranty cannot be deleted.`}
        confirmLabel="Delete Document"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) {
            setIsOpen(false);
          }
        }}
      />
    </>
  );
}