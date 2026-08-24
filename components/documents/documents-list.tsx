"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import SearchBar from "@/components/ui/search-bar";
import ProcessDocumentButton from "@/components/process-document-button";
import DeleteDocumentButton from "@/components/documents/delete-document-button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";

type Document = {
  id: string;
  file_name: string;
  status: string;
};

export default function DocumentsList({
  documents,
}: {
  documents: Document[];
}) {
  const [search, setSearch] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredDocuments = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return documents;
    }

    return documents.filter(
      (doc) =>
        doc.file_name.toLowerCase().includes(query) ||
        doc.status.toLowerCase().includes(query)
    );
  }, [documents, search]);

  const allVisibleSelected =
    filteredDocuments.length > 0 &&
    filteredDocuments.every((doc) =>
      selectedIds.includes(doc.id)
    );

  function toggleDocument(documentId: string) {
    setSelectedIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId]
    );
  }

  function toggleSelectAll() {
    const visibleIds = filteredDocuments.map(
      (doc) => doc.id
    );

    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) => !visibleIds.includes(id)
        )
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...visibleIds]),
    ]);
  }

  function cancelSelection() {
    setSelectMode(false);
    setSelectedIds([]);
    setError(null);
  }

  async function deleteSelectedDocuments() {
    if (selectedIds.length === 0) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const deletedIds: string[] = [];
    const failedFiles: string[] = [];

    try {
      for (const documentId of selectedIds) {
        const document = documents.find(
          (doc) => doc.id === documentId
        );

        try {
          const response = await fetch(
            `/api/documents/${documentId}`,
            {
              method: "DELETE",
            }
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.error ??
                "Failed to delete document."
            );
          }

          deletedIds.push(documentId);
        } catch {
          failedFiles.push(
            document?.file_name ?? "Unknown document"
          );
        }
      }

      setIsDeleteDialogOpen(false);

      if (failedFiles.length > 0) {
        setError(
          `${failedFiles.length} document${
            failedFiles.length === 1 ? "" : "s"
          } could not be deleted because they may still be linked to another record.`
        );

        toast.warning(
          `${deletedIds.length} deleted, ${failedFiles.length} could not be deleted.`
        );
      } else {
        toast.success(
          `${deletedIds.length} document${
            deletedIds.length === 1 ? "" : "s"
          } deleted successfully.`
        );
      }

      setSelectedIds(
        failedFiles.length > 0
          ? selectedIds.filter(
              (id) => !deletedIds.includes(id)
            )
          : []
      );

      if (failedFiles.length === 0) {
        setSelectMode(false);
      }

      window.location.reload();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search documents..."
          />
        </div>

        {!selectMode ? (
          <button
            type="button"
            onClick={() => setSelectMode(true)}
            disabled={filteredDocuments.length === 0}
            className="rounded-lg border bg-background px-5 py-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:py-0"
          >
            Select
          </button>
        ) : (
          <div className="flex items-stretch gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted"
            >
              {allVisibleSelected
                ? "Deselect All"
                : "Select All"}
            </button>

            <button
              type="button"
              onClick={cancelSelection}
              disabled={isDeleting}
              className="rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                setIsDeleteDialogOpen(true)
              }
              disabled={
                selectedIds.length === 0 ||
                isDeleting
              }
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="size-4" />

              Delete
              {selectedIds.length > 0
                ? ` (${selectedIds.length})`
                : ""}
            </button>
          </div>
        )}
      </div>

      {selectMode && (
        <p className="mb-4 text-sm text-muted-foreground">
          {selectedIds.length} selected
        </p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {filteredDocuments.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No matching documents found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => {
            const selected =
              selectedIds.includes(doc.id);

            if (selectMode) {
              return (
                <div
                  key={doc.id}
                  onClick={() =>
                    toggleDocument(doc.id)
                  }
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition ${
                    selected
                      ? "border-primary bg-muted/40"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleDocument(doc.id)
                    }
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className="size-4"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {doc.file_name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Status: {doc.status}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={doc.id}
                className="flex flex-col gap-4 rounded-lg border p-4 transition hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words font-semibold sm:truncate">
                    {doc.file_name}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Status: {doc.status}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                  >
                    <Link href={`/documents/${doc.id}`}>
                      View
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <Link
                      href={`/documents/${doc.id}/review`}
                    >
                      Review
                    </Link>
                  </Button>

                  <ProcessDocumentButton
                    documentId={doc.id}
                  />

                  <DeleteDocumentButton
                    documentId={doc.id}
                    fileName={doc.file_name}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={`Delete ${selectedIds.length} ${
          selectedIds.length === 1
            ? "Document"
            : "Documents"
        }`}
        description={`Are you sure you want to permanently delete ${
          selectedIds.length
        } selected ${
          selectedIds.length === 1
            ? "document"
            : "documents"
        }?

The files will be removed from storage and cannot be recovered.

Documents linked to an asset, personal record, or warranty cannot be deleted.`}
        confirmLabel={
          selectedIds.length === 1
            ? "Delete Document"
            : `Delete ${selectedIds.length} Documents`
        }
        isLoading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(false);
          }
        }}
        onConfirm={deleteSelectedDocuments}
      />
    </>
  );
}