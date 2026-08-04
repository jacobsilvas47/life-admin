import { notFound } from "next/navigation";
import Link from "next/link";

import { supabaseServer } from "@/lib/supabase-server";
import BackButton from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date/format-date";
import DeleteReminderButton from "@/components/reminders/delete-reminder-button";

export default async function ReminderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: reminder, error } =
    await supabaseServer
      .from("reminders")
      .select(`
        *,
        assets (
          id,
          name
        ),
        personal_records (
          id,
          title
        ),
        warranties (
          id,
          provider
        )
      `)
      .eq("id", id)
      .single();

  if (error || !reminder) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <BackButton
        fallbackHref="/reminders"
        label="Back to Reminders"
      />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {reminder.title}
          </h1>

          <p className="text-muted-foreground mt-2">
            Due {formatDate(reminder.due_date)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
        <Link
            href={`/reminders/${reminder.id}/edit`}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
        >
            ✏️ Edit
        </Link>

        <DeleteReminderButton
            reminderId={reminder.id}
            reminderTitle={reminder.title}
        />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <InfoRow
            label="Due Date"
            value={formatDate(reminder.due_date)}
          />

          <InfoRow
            label="Completed"
            value={reminder.completed ? "Yes" : "No"}
          />

          <InfoRow
            label="Notification Schedule"
            value={
                reminder.notification_offsets?.length
                ? reminder.notification_offsets
                    .map((offset: number) =>
                        offset === 0
                        ? "Due date"
                        : `${offset} day${offset === 1 ? "" : "s"} before`
                    )
                    .join(", ")
                : "No notifications scheduled"
            }
            />

        </CardContent>
      </Card>

      {reminder.notes && (
        <Card>
            <CardHeader>
            <CardTitle>Notes</CardTitle>
            </CardHeader>

            <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">
                {reminder.notes}
            </p>
            </CardContent>
        </Card>
        )}

      {reminder.assets && (
        <Card>
          <CardHeader>
            <CardTitle>Linked Asset</CardTitle>
          </CardHeader>

          <CardContent>

            <Link
              href={`/assets/${reminder.assets.id}`}
              className="text-blue-600 hover:underline"
            >
              {reminder.assets.name}
            </Link>

          </CardContent>
        </Card>
      )}

      {reminder.personal_records && (
        <Card>
          <CardHeader>
            <CardTitle>Linked Personal Record</CardTitle>
          </CardHeader>

          <CardContent>

            <Link
              href={`/personal-records/${reminder.personal_records.id}`}
              className="text-blue-600 hover:underline"
            >
              {reminder.personal_records.title}
            </Link>

          </CardContent>
        </Card>
      )}
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-medium">
        {label}
      </span>

      <span className="text-muted-foreground">
        {value ?? "—"}
      </span>
    </div>
  );
}