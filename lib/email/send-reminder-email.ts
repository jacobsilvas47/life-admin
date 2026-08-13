import { Resend } from "resend";

import {
  formatDate,
  type DateFormat,
} from "@/lib/date/format-date";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

type SendReminderEmailInput = {
  recipient: string;
  title: string;
  dueDate: string;
  notificationOffset: number;
  dateFormat: DateFormat;
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
  recipient,
  title,
  dueDate,
  notificationOffset,
  dateFormat,
  notes,
}: SendReminderEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const formattedDueDate = formatDate(
    dueDate,
    dateFormat
  );

  const timingText = getTimingText(
    notificationOffset
  );

  const { data, error } =
    await resend.emails.send({
      /*
       * Keep the Resend testing sender for now.
       * We'll replace this when Life Admin
       * has its production email domain.
       */
      from:
        "Life Admin <onboarding@resend.dev>",

      to: recipient,

      subject:
        `${title} is ${timingText}`,

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