"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import SearchBar from "@/components/ui/search-bar";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  formatDate,
  type DateFormat,
} from "@/lib/date/format-date";

type Reminder = {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;

  asset_id: string | null;
  personal_record_id: string | null;

  assets: {
    id: string;
    name: string;
  } | null;

  personal_records: {
    id: string;
    title: string;
  } | null;
};

export default function RemindersList({
  reminders,
  dateFormat,
}: {
  reminders: Reminder[];
  dateFormat: DateFormat;
}) {
  const [search, setSearch] = useState("");
  const [selectMode, setSelectMode] =
    useState(false);
  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);
  const [
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
  ] = useState(false);
  const [isDeleting, setIsDeleting] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return reminders;
    }

    return reminders.filter((reminder) =>
      [
        reminder.title,
        reminder.assets?.name,
        reminder.personal_records?.title,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(query)
        )
    );
  }, [search, reminders]);

  const allVisibleSelected =
    filtered.length > 0 &&
    filtered.every((reminder) =>
      selectedIds.includes(reminder.id)
    );

  function toggleReminder(reminderId: string) {
    setSelectedIds((current) =>
      current.includes(reminderId)
        ? current.filter(
            (id) => id !== reminderId
          )
        : [...current, reminderId]
    );
  }

  function toggleSelectAll() {
    const visibleIds = filtered.map(
      (reminder) => reminder.id
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

  async function deleteSelectedReminders() {
    if (selectedIds.length === 0) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const results = await Promise.all(
        selectedIds.map(async (reminderId) => {
          const response = await fetch(
            `/api/reminders/${reminderId}`,
            {
              method: "DELETE",
            }
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.error ??
                "Failed to delete reminder."
            );
          }

          return reminderId;
        })
      );

      if (
        results.length !== selectedIds.length
      ) {
        throw new Error(
          "Some reminders could not be deleted."
        );
      }

      setIsDeleteDialogOpen(false);

      window.location.reload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete selected reminders."
      );
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
            placeholder="Search reminders..."
          />
        </div>

        {!selectMode ? (
          <button
            type="button"
            onClick={() =>
              setSelectMode(true)
            }
            disabled={filtered.length === 0}
            className="rounded-lg border bg-background px-5 py-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:py-0"
          >
            Select
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="rounded-lg border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              {allVisibleSelected
                ? "Deselect All"
                : "Select All"}
            </button>

            <button
              type="button"
              onClick={cancelSelection}
              disabled={isDeleting}
              className="rounded-lg border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
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

      {filtered.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {reminders.length === 0
              ? "No reminders yet."
              : "No matching reminders found."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((reminder) => {
            const due = new Date(
              `${reminder.due_date}T12:00:00`
            );

            const today = new Date();

            const diff = Math.ceil(
              (due.getTime() -
                today.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            let badge = "Upcoming";
            let badgeColor =
              "bg-gray-100 text-gray-700";

            if (reminder.completed) {
              badge = "Completed";
              badgeColor =
                "bg-green-100 text-green-700";
            } else if (diff < 0) {
              badge = "Overdue";
              badgeColor =
                "bg-red-100 text-red-700";
            } else if (diff <= 30) {
              badge = "Soon";
              badgeColor =
                "bg-yellow-100 text-yellow-800";
            }

            const selected =
              selectedIds.includes(reminder.id);

            const reminderCard = (
              <div
                className={`rounded-xl border p-5 transition ${
                  selectMode
                    ? "cursor-pointer"
                    : "cursor-pointer hover:border-primary hover:bg-muted/40"
                } ${
                  selected
                    ? "border-primary bg-muted/40"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleReminder(
                          reminder.id
                        )
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      className="mt-1 size-4 shrink-0"
                    />
                  )}

                  <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold">
                        {reminder.title}
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        Due{" "}
                        {formatDate(
                          reminder.due_date,
                          dateFormat
                        )}
                      </p>

                      {reminder.assets && (
                        <p className="mt-2 text-sm text-blue-600">
                          {reminder.assets.name}
                        </p>
                      )}

                      {reminder.personal_records && (
                        <p className="mt-2 text-sm text-blue-600">
                          {
                            reminder
                              .personal_records
                              .title
                          }
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}
                    >
                      {badge}
                    </span>
                  </div>
                </div>
              </div>
            );

            if (selectMode) {
              return (
                <div
                  key={reminder.id}
                  onClick={() =>
                    toggleReminder(
                      reminder.id
                    )
                  }
                >
                  {reminderCard}
                </div>
              );
            }

            return (
              <Link
                key={reminder.id}
                href={`/reminders/${reminder.id}`}
                className="block"
              >
                {reminderCard}
              </Link>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={`Delete ${selectedIds.length} ${
          selectedIds.length === 1
            ? "Reminder"
            : "Reminders"
        }`}
        description={`Are you sure you want to permanently delete ${
          selectedIds.length
        } selected ${
          selectedIds.length === 1
            ? "reminder"
            : "reminders"
        }?

The linked asset, personal record, warranty, and documents will remain available.`}
        confirmLabel={
          selectedIds.length === 1
            ? "Delete Reminder"
            : `Delete ${selectedIds.length} Reminders`
        }
        isLoading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(false);
          }
        }}
        onConfirm={deleteSelectedReminders}
      />
    </>
  );
}