"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

type Reminder = {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
  notification_offsets: number[] | null;
  notes: string | null;
};

export default function ReminderEditForm({
  reminder,
  canUseAdvancedReminders,
}: {
  reminder: Reminder;
  canUseAdvancedReminders: boolean;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(
    reminder.title
  );

  const [dueDate, setDueDate] = useState(
    reminder.due_date
  );

  const [completed, setCompleted] = useState(
    reminder.completed
  );

  const [
    notificationOffsets,
    setNotificationOffsets,
  ] = useState<number[]>(
    reminder.notification_offsets ?? [30, 7, 1]
  );

  const [notes, setNotes] = useState(
    reminder.notes ?? ""
  );

  const [isSaving, setIsSaving] =
    useState(false);

  function toggleOffset(offset: number) {
    setNotificationOffsets((current) =>
      current.includes(offset)
        ? current.filter(
            (value) => value !== offset
          )
        : [...current, offset].sort(
            (a, b) => b - a
          )
    );
  }

  async function saveChanges() {
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/reminders/${reminder.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            dueDate,
            completed,

            /*
             * Free users receive the standard
             * reminder 7 days before the due date.
             *
             * Premium users can save their custom
             * notification schedule.
             */
            notificationOffsets:
              canUseAdvancedReminders
                ? notificationOffsets
                : [7],

            notes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Failed to update reminder."
        );
      }

      toast.success("Reminder updated.");

      router.push(
        `/reminders/${reminder.id}`
      );

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update reminder."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8 rounded-xl border bg-white p-6 shadow-sm">
      {/* Title */}
      <div>
        <label className="mb-2 block font-medium">
          Title
        </label>

        <input
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="mb-2 block font-medium">
          Due Date
        </label>

        <input
          type="date"
          value={dueDate}
          onChange={(event) =>
            setDueDate(event.target.value)
          }
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* Notification Preferences */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                Notify Me
              </p>

              {!canUseAdvancedReminders && (
                <span className="rounded-full bg-black px-2 py-0.5 text-xs font-medium text-white">
                  Premium
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {canUseAdvancedReminders
                ? "Choose exactly when you'd like to receive reminders."
                : "Free reminders notify you 7 days before the due date. Premium lets you create a custom notification schedule."}
            </p>
          </div>
        </div>

        {canUseAdvancedReminders ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                value: 180,
                label: "6 months before",
              },
              {
                value: 90,
                label: "90 days before",
              },
              {
                value: 30,
                label: "30 days before",
              },
              {
                value: 14,
                label: "14 days before",
              },
              {
                value: 7,
                label: "7 days before",
              },
              {
                value: 3,
                label: "3 days before",
              },
              {
                value: 1,
                label: "1 day before",
              },
              {
                value: 0,
                label: "On the due date",
              },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition hover:border-primary hover:bg-muted/40"
              >
                <input
                  type="checkbox"
                  checked={notificationOffsets.includes(
                    option.value
                  )}
                  onChange={() =>
                    toggleOffset(
                      option.value
                    )
                  }
                />

                <span className="text-sm">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
              <input
                type="checkbox"
                checked
                disabled
                readOnly
              />

              <span className="text-sm">
                7 days before
              </span>
            </div>

            <Link
              href="/upgrade"
              className="inline-flex text-sm font-medium underline underline-offset-4"
            >
              Unlock custom reminder schedules
              with Premium
            </Link>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 block font-medium">
          Notes
        </label>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          rows={6}
          placeholder="Add helpful notes for this reminder..."
          className="w-full resize-y rounded-lg border p-3"
        />
      </div>

      {/* Completed */}
      <label className="flex items-center gap-3 rounded-lg border p-4">
        <input
          type="checkbox"
          checked={completed}
          onChange={(event) =>
            setCompleted(
              event.target.checked
            )
          }
        />

        <div>
          <p className="font-medium">
            Completed
          </p>

          <p className="text-sm text-muted-foreground">
            Mark this reminder as finished.
          </p>
        </div>
      </label>

      {/* Save */}
      <button
        onClick={saveChanges}
        disabled={isSaving}
        className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving
          ? "Saving..."
          : "Save Changes"}
      </button>
    </div>
  );
}