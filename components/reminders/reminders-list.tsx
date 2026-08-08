"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import SearchBar from "@/components/ui/search-bar";
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

  return (
    <>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search reminders..."
      />

      <div className="space-y-4">
        {filtered.map((reminder) => {
          // Use the raw database date for calculations.
          // Do NOT use the formatted display date here.
          const due = new Date(
            `${reminder.due_date}T12:00:00`
          );

          const today = new Date();

          const diff = Math.ceil(
            (due.getTime() - today.getTime()) /
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

          return (
            <Link
              key={reminder.id}
              href={`/reminders/${reminder.id}`}
              className="block"
            >
              <div className="rounded-xl border p-5 transition hover:border-primary hover:bg-muted/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
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
                        {reminder.personal_records.title}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}
                  >
                    {badge}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}