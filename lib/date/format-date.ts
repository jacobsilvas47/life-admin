export type DateFormat =
  | "MM/DD/YYYY"
  | "DD/MM/YYYY"
  | "YYYY-MM-DD";

export function formatDate(
  date: string | null | undefined,
  dateFormat: DateFormat = "MM/DD/YYYY"
) {
  if (!date) {
    return "—";
  }

  /*
   * Date-only database values such as "2029-07-11" can shift
   * backward by one day when parsed as UTC in some time zones.
   * Adding a local noon time prevents that date-shifting issue.
   */
  const normalizedDate =
    /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T12:00:00`)
      : new Date(date);

  if (Number.isNaN(normalizedDate.getTime())) {
    return "—";
  }

  const year = normalizedDate.getFullYear();
  const month = String(
    normalizedDate.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    normalizedDate.getDate()
  ).padStart(2, "0");

  switch (dateFormat) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;

    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;

    case "MM/DD/YYYY":
    default:
      return `${month}/${day}/${year}`;
  }
}