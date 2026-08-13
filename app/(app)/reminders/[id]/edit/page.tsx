import { notFound } from "next/navigation";

import { supabaseServer } from "@/lib/supabase-server";
import { getEntitlements } from "@/lib/subscriptions/get-entitlements";

import BackButton from "@/components/ui/back-button";
import ReminderEditForm from "@/components/reminders/reminder-edit-form";

export default async function ReminderEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  /*
   * Load the current user's subscription
   * entitlements on the server.
   */
  const entitlements = await getEntitlements();

  const { data: reminder, error } =
    await supabaseServer
      .from("reminders")
      .select("*")
      .eq("id", id)
      .single();

  if (error || !reminder) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <BackButton
        fallbackHref={`/reminders/${id}`}
        label="Back to Reminder"
      />

      <div>
        <h1 className="text-3xl font-bold">
          Edit Reminder
        </h1>

        <p className="mt-2 text-muted-foreground">
          Update this reminder&apos;s information.
        </p>
      </div>

      <ReminderEditForm
        reminder={reminder}
        canUseAdvancedReminders={
          entitlements.canUseAdvancedReminders
        }
      />
    </main>
  );
}