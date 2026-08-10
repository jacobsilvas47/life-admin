import { cache } from "react";

import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
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
    const authSupabase =
      await createAuthServerClient();

    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      return DEFAULT_SETTINGS;
    }

    const { data, error } =
      await supabaseServer
        .from("user_settings")
        .select(`
          id,
          date_format,
          timezone,
          email_notifications,
          default_notification_offsets
        `)
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
      console.error(
        "Failed to load user settings:",
        error
      );

      return DEFAULT_SETTINGS;
    }

    if (!data) {
      const {
        data: newSettings,
        error: createError,
      } = await supabaseServer
        .from("user_settings")
        .insert({
          user_id: user.id,
          date_format:
            DEFAULT_SETTINGS.date_format,
          timezone:
            DEFAULT_SETTINGS.timezone,
          email_notifications:
            DEFAULT_SETTINGS.email_notifications,
          default_notification_offsets:
            DEFAULT_SETTINGS.default_notification_offsets,
        })
        .select(`
          id,
          date_format,
          timezone,
          email_notifications,
          default_notification_offsets
        `)
        .single();

      if (createError || !newSettings) {
        console.error(
          "Failed to create user settings:",
          createError
        );

        return DEFAULT_SETTINGS;
      }

      return {
        id: newSettings.id,
        date_format:
          newSettings.date_format as
            UserSettings["date_format"],
        timezone: newSettings.timezone,
        email_notifications:
          newSettings.email_notifications,
        default_notification_offsets:
          newSettings.default_notification_offsets,
      };
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
        : DEFAULT_SETTINGS.date_format;

    return {
      id: data.id,
      date_format:
        dateFormat as UserSettings["date_format"],
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