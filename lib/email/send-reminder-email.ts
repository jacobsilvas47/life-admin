import { Resend } from "resend";

import { formatDate } from "@/lib/date/format-date";
import { getUserSettings } from "@/lib/settings/get-user-settings";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

type SendReminderEmailInput = {
  title: string;
  dueDate: string;
  notificationOffset: number;
  notes?: string | null;
};

function getTimingText(offset: number) {
  if (offset === 0) {
    return "due today";
  }

  if (offset === 1) {
    return "due tomorrow";
  }

  return `due in ${offset} days`;
}

export async function sendReminderEmail({
  title,
  dueDate,
  notificationOffset,
  notes,
}: SendReminderEmailInput) {
  const recipient =
    process.env.REMINDER_EMAIL_TO;

  if (!recipient) {
    throw new Error(
      "REMINDER_EMAIL_TO is not configured."
    );
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const settings = await getUserSettings();

  const formattedDueDate = formatDate(
    dueDate,
    settings.date_format
  );

  const timingText = getTimingText(
    notificationOffset
  );

  const { data, error } = await resend.emails.send({
    /*
     * Resend's testing sender works while developing.
     * We'll replace this with our Life Admin domain later.
     */
    from: "Life Admin <onboarding@resend.dev>",

    to: recipient,

    subject: `${title} is ${timingText}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="font-size: 24px;">
          Life Admin Reminder
        </h1>

        <h2>
          ${title}
        </h2>

        <p>
          This reminder is <strong>${timingText}</strong>.
        </p>

        <p>
          Due date: <strong>${formattedDueDate}</strong>
        </p>

        ${
          notes
            ? `
              <div style="margin-top: 24px;">
                <strong>Notes</strong>
                <p>${notes}</p>
              </div>
            `
            : ""
        }

        <p style="margin-top: 32px; color: #666;">
          Sent by Life Admin
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}