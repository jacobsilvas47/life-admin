import { supabaseServer } from "@/lib/supabase-server";
import SettingsForm from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const { data: settings, error } =
    await supabaseServer
      .from("user_settings")
      .select("*")
      .limit(1)
      .single();

  if (error || !settings) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="mt-4 text-red-500">
          {error?.message ??
            "Could not load settings."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your display and notification preferences.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </main>
  );
}