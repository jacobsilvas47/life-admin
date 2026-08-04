"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/ui/search-bar";
import { formatDate } from "@/lib/date/format-date";

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
}: {
  reminders: Reminder[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return reminders;

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
          const due = new Date(formatDate(reminder.due_date));
          const today = new Date();

          const diff = Math.ceil(
            (due.getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          let badge = "Upcoming";
          let badgeColor =
            "bg-gray-100 text-gray-700";

          if (diff < 0) {
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
              <div className="rounded-xl border p-5 transition hover:bg-muted/40 hover:border-primary">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {reminder.title}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      Due {formatDate(reminder.due_date)}
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