"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

type Settings = {
  id: string;
  date_format: string;
  timezone: string;
  email_notifications: boolean;
  default_notification_offsets: number[];
};

type NotificationOption = {
  value: number;
  label: string;
};

const notificationOptions: NotificationOption[] = [
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
];

export default function SettingsForm({
  settings,
}: {
  settings: Settings;
}) {
  const [dateFormat, setDateFormat] = useState(
    settings.date_format
  );

  const [timezone, setTimezone] = useState(
    settings.timezone
  );

  const [
    emailNotifications,
    setEmailNotifications,
  ] = useState(settings.email_notifications);

  const [
    defaultNotificationOffsets,
    setDefaultNotificationOffsets,
  ] = useState<number[]>(
    settings.default_notification_offsets ?? [
      30,
      7,
      1,
    ]
  );

  const [isSaving, setIsSaving] =
    useState(false);

    const [savedSettings, setSavedSettings] =
  useState({
    dateFormat: settings.date_format,
    timezone: settings.timezone,
    emailNotifications:
      settings.email_notifications,
    defaultNotificationOffsets: [
      ...(settings.default_notification_offsets ??
        [30, 7, 1]),
    ].sort((a, b) => b - a),
  });

const hasChanges = useMemo(() => {
  const currentOffsets = [
    ...defaultNotificationOffsets,
  ].sort((a, b) => b - a);

  return (
    dateFormat !== savedSettings.dateFormat ||
    timezone !== savedSettings.timezone ||
    emailNotifications !==
      savedSettings.emailNotifications ||
    JSON.stringify(currentOffsets) !==
      JSON.stringify(
        savedSettings.defaultNotificationOffsets
      )
  );
}, [
  dateFormat,
  timezone,
  emailNotifications,
  defaultNotificationOffsets,
  savedSettings,
]);

  function toggleOffset(offset: number) {
    setDefaultNotificationOffsets((current) =>
      current.includes(offset)
        ? current.filter(
            (value) => value !== offset
          )
        : [...current, offset].sort(
            (a, b) => b - a
          )
    );
  }

  async function saveSettings() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        "/api/settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: settings.id,
            dateFormat,
            timezone,
            emailNotifications,
            defaultNotificationOffsets,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ??
            "Failed to update settings."
        );
      }

      setSavedSettings({
        dateFormat,
        timezone,
        emailNotifications,
        defaultNotificationOffsets: [
          ...defaultNotificationOffsets,
        ].sort((a, b) => b - a),
      });

      toast.success("Settings updated.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update settings."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Regional Preferences
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Control how dates and times appear in Life Admin.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block font-medium">
              Date Format
            </label>

            <select
              value={dateFormat}
              onChange={(event) =>
                setDateFormat(event.target.value)
              }
              className="w-full rounded-lg border bg-background p-3"
            >
              <option value="MM/DD/YYYY">
                MM/DD/YYYY — 07/11/2029
              </option>

              <option value="DD/MM/YYYY">
                DD/MM/YYYY — 11/07/2029
              </option>

              <option value="YYYY-MM-DD">
                YYYY-MM-DD — 2029-07-11
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Time Zone
            </label>

            <select
              value={timezone}
              onChange={(event) =>
                setTimezone(event.target.value)
              }
              className="w-full rounded-lg border bg-background p-3"
            >
              <option value="America/Los_Angeles">
                Pacific Time
              </option>

              <option value="America/Denver">
                Mountain Time
              </option>

              <option value="America/Chicago">
                Central Time
              </option>

              <option value="America/New_York">
                Eastern Time
              </option>

              <option value="America/Edmonton">
                Edmonton
              </option>

              <option value="UTC">
                UTC
              </option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Notifications
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose how reminder notifications should work.
        </p>

        <div className="mt-6 space-y-6">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="font-medium">
                Email Notifications
              </p>

              <p className="text-sm text-muted-foreground">
                Receive reminder notifications by email.
              </p>
            </div>

            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) =>
                setEmailNotifications(
                  event.target.checked
                )
              }
              className="size-4"
            />
          </label>

          <div>
            <p className="font-medium">
              Default Reminder Schedule
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              New reminders will use these notification times by default.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {notificationOptions.map(
                (option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition hover:border-primary hover:bg-muted/40"
                  >
                    <input
                      type="checkbox"
                      checked={defaultNotificationOffsets.includes(
                        option.value
                      )}
                      onChange={() =>
                        toggleOffset(option.value)
                      }
                    />

                    <span className="text-sm">
                      {option.label}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveSettings}
          disabled={isSaving || !hasChanges}
          className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
        ? "Saving..."
        : hasChanges
          ? "Save Changes"
          : "Saved"}
        </button>
      </div>
    </div>
  );
}