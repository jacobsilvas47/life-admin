import type { DateFormat } from "@/lib/date/format-date";

export type UserSettings = {
  id: string;
  date_format: DateFormat;
  timezone: string;
  email_notifications: boolean;
  default_notification_offsets: number[];
};