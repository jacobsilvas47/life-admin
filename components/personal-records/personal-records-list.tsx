"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import SearchBar from "@/components/ui/search-bar";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";

type PersonalRecord = {
  id: string;
  title: string;
  record_type: string;
  expiration_date: string | null;
};

export default function PersonalRecordsList({
  records,
}: {
  records: PersonalRecord[];
}) {
  const [search, setSearch] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return records;
    }

    return records.filter((record) =>
      [
        record.title,
        record.record_type,
        record.expiration_date,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(query)
        )
    );
  }, [records, search]);

  const allVisibleSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((record) =>
      selectedIds.includes(record.id)
    );

  function toggleRecord(recordId: string) {
    setSelectedIds((current) =>
      current.includes(recordId)
        ? current.filter((id) => id !== recordId)
        : [...current, recordId]
    );
  }

  function toggleSelectAll() {
    const visibleIds = filteredRecords.map(
      (record) => record.id
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

  async function deleteSelectedRecords() {
    if (selectedIds.length === 0) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const results = await Promise.all(
        selectedIds.map(async (recordId) => {
          const response = await fetch(
            `/api/personal-records/${recordId}`,
            {
              method: "DELETE",
            }
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.error ??
                "Failed to delete personal record."
            );
          }

          return recordId;
        })
      );

      if (results.length !== selectedIds.length) {
        throw new Error(
          "Some personal records could not be deleted."
        );
      }

      setIsDeleteDialogOpen(false);

      window.location.reload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete selected personal records."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search personal records..."
          />
        </div>

        {!selectMode ? (
          <button
            type="button"
            onClick={() => setSelectMode(true)}
            disabled={filteredRecords.length === 0}
            className="self-stretch rounded-lg border bg-background px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Select
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
            >
              {allVisibleSelected
                ? "Deselect All"
                : "Select All"}
            </button>

            <button
              type="button"
              onClick={cancelSelection}
              disabled={isDeleting}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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

      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <h2 className="text-xl font-semibold">
              No matching records
            </h2>

            <p className="mt-2 text-muted-foreground">
              Try a different search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map((record) => {
            const selected =
              selectedIds.includes(record.id);

            const card = (
              <Card
                className={`transition ${
                  selectMode
                    ? "cursor-pointer"
                    : "cursor-pointer hover:border-primary"
                } ${
                  selected
                    ? "border-primary bg-muted/40"
                    : ""
                }`}
              >
                <CardContent className="flex items-start gap-4 p-6">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleRecord(record.id)
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      className="mt-1 size-4"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold">
                      {record.title}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {record.record_type.replaceAll(
                        "_",
                        " "
                      )}
                    </p>

                    {record.expiration_date && (
                      <p className="mt-2 text-sm">
                        Expires:{" "}
                        {record.expiration_date}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );

            if (selectMode) {
              return (
                <div
                  key={record.id}
                  onClick={() =>
                    toggleRecord(record.id)
                  }
                >
                  {card}
                </div>
              );
            }

            return (
              <Link
                key={record.id}
                href={`/personal-records/${record.id}`}
              >
                {card}
              </Link>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={`Delete ${selectedIds.length} Personal ${
          selectedIds.length === 1
            ? "Record"
            : "Records"
        }`}
        description={`Are you sure you want to permanently delete ${
          selectedIds.length
        } selected personal ${
          selectedIds.length === 1
            ? "record"
            : "records"
        }?

The original uploaded documents will remain available.`}
        confirmLabel={
          selectedIds.length === 1
            ? "Delete Record"
            : `Delete ${selectedIds.length} Records`
        }
        isLoading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(false);
          }
        }}
        onConfirm={deleteSelectedRecords}
      />
    </>
  );
}