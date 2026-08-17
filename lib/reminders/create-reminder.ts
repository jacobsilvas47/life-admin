import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { createActivity } from "@/lib/activity/create-activity";
import { getUserSettings } from "@/lib/settings/get-user-settings";
import { getEntitlements } from "@/lib/subscriptions/get-entitlements";

type CreateReminderInput = {
  title: string;
  dueDate: string;

  assetId?: string | null;
  personalRecordId?: string | null;
  warrantyId?: string | null;

  notificationOffsets?: number[] | null;
  notes?: string | null;
};

export async function createReminder(
  input: CreateReminderInput
) {
  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      "You must be signed in to create a reminder."
    );
  }

  /*
   * If the reminder is linked to an asset,
   * verify that the asset belongs to this user.
   */
  if (input.assetId) {
    const { data: asset, error } =
      await supabaseServer
        .from("assets")
        .select("id")
        .eq("id", input.assetId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!asset) {
      throw new Error("Asset not found.");
    }
  }

  /*
   * If linked to a personal record,
   * verify ownership.
   */
  if (input.personalRecordId) {
    const { data: record, error } =
      await supabaseServer
        .from("personal_records")
        .select("id")
        .eq("id", input.personalRecordId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!record) {
      throw new Error(
        "Personal record not found."
      );
    }
  }

  /*
   * Warranties currently belong to assets rather
   * than having their own user_id, so verify
   * ownership through the parent asset.
   */
  if (input.warrantyId) {
    const { data: warranty, error } =
      await supabaseServer
        .from("warranties")
        .select(`
          id,
          assets!inner (
            id,
            user_id
          )
        `)
        .eq("id", input.warrantyId)
        .eq("assets.user_id", user.id)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!warranty) {
      throw new Error(
        "Warranty not found."
      );
    }
  }

  /*
   * These settings are already scoped to the
   * authenticated user.
   */
  const settings = await getUserSettings();
  const entitlements = await getEntitlements();

  const notificationOffsets =
    entitlements.canUseAdvancedReminders
      ? input.notificationOffsets ??
        settings.default_notification_offsets
      : [7];

  const { data: reminder, error } =
    await supabaseServer
      .from("reminders")
      .insert({
        user_id: user.id,

        title: input.title,
        due_date: input.dueDate,

        asset_id: input.assetId ?? null,
        personal_record_id:
          input.personalRecordId ?? null,
        warranty_id:
          input.warrantyId ?? null,

        notification_offsets:
          notificationOffsets,

        notes: input.notes ?? null,
      })
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  await createActivity({
    assetId: input.assetId ?? undefined,
    personalRecordId:
      input.personalRecordId ?? undefined,
    warrantyId:
      input.warrantyId ?? undefined,

    activityType: "reminder_created",
    title: `Created reminder: ${input.title}`,
  });

  return reminder;
}