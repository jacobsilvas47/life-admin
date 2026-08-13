import { supabaseServer } from "@/lib/supabase-server";
import { getDueNotifications } from "@/lib/reminders/get-due-notifications";
import { sendReminderEmail } from "@/lib/email/send-reminder-email";

export async function processDueNotifications() {
  const notifications =
    await getDueNotifications();

  let sent = 0;
  let failed = 0;

  for (const notification of notifications) {
    try {
      /*
       * Claim this reminder/offset before sending.
       *
       * The unique database constraint prevents the
       * same reminder notification from being processed
       * more than once.
       */
      const {
        data: notificationLog,
        error: insertError,
      } = await supabaseServer
        .from("reminder_notifications")
        .insert({
          reminder_id: notification.reminderId,
          notification_offset:
            notification.notificationOffset,
          channel: "email",
          status: "processing",
        })
        .select()
        .single();

      /*
       * If another process already claimed this exact
       * notification, skip it.
       */
      if (insertError) {
        if (insertError.code === "23505") {
          continue;
        }

        throw new Error(insertError.message);
      }

      await sendReminderEmail({
        recipient: notification.email,
        title: notification.title,
        dueDate: notification.dueDate,
        notificationOffset:
          notification.notificationOffset,
        dateFormat: notification.dateFormat,
        notes: notification.notes,
      });

      const { error: updateError } =
        await supabaseServer
          .from("reminder_notifications")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", notificationLog.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      sent++;
    } catch (error: unknown) {
      failed++;

      console.error(
        "Reminder notification failed:",
        error
      );
    }
  }

  return {
    found: notifications.length,
    sent,
    failed,
  };
}