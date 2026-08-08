import { supabaseServer } from "@/lib/supabase-server";
import RemindersList from "@/components/reminders/reminders-list";
import { getUserSettings } from "@/lib/settings/get-user-settings";

export default async function RemindersPage() {
  const settings = await getUserSettings();

  const { data: reminders, error } =
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
        )
      `)
      .order("due_date", {
        ascending: true,
      });

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-8">
        <p className="text-red-500">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Reminders
        </h1>

        <p className="mt-2 text-muted-foreground">
          Track upcoming renewals,
          warranties and important dates.
        </p>
      </div>

      <RemindersList
        reminders={reminders ?? []}
        dateFormat={settings.date_format}
      />
    </main>
  );
}