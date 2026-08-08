import { cache } from "react";

import { supabaseServer } from "@/lib/supabase-server";
import type { UserSettings } from "@/types/user-settings";

const DEFAULT_SETTINGS: UserSettings = {
  id: "",
  date_format: "MM/DD/YYYY",
  timezone: "America/Los_Angeles",
  email_notifications: true,
  default_notification_offsets: [30, 7, 1],
};

export const getUserSettings = cache(
  async (): Promise<UserSettings> => {
    const { data, error } = await supabaseServer
      .from("user_settings")
      .select(`
        id,
        date_format,
        timezone,
        email_notifications,
        default_notification_offsets
      `)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Failed to load user settings:",
        error
      );

      return DEFAULT_SETTINGS;
    }

    if (!data) {
      return DEFAULT_SETTINGS;
    }

    const validDateFormats = [
      "MM/DD/YYYY",
      "DD/MM/YYYY",
      "YYYY-MM-DD",
    ] as const;

    const dateFormat =
      validDateFormats.includes(
        data.date_format as
          (typeof validDateFormats)[number]
      )
        ? data.date_format
        : "MM/DD/YYYY";

    return {
      id: data.id,
      date_format: dateFormat,
      timezone:
        data.timezone ??
        DEFAULT_SETTINGS.timezone,
      email_notifications:
        data.email_notifications ?? true,
      default_notification_offsets:
        data.default_notification_offsets ??
        DEFAULT_SETTINGS.default_notification_offsets,
    };
  }
);