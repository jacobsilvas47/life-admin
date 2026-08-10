import SettingsForm from "@/components/settings/settings-form";
import { getUserSettings } from "@/lib/settings/get-user-settings";

export default async function SettingsPage() {
  const settings = await getUserSettings();

  return (
    <main className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your display and notification
          preferences.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </main>
  );
}