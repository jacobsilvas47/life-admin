export function formatDate(
  date: string | null | undefined,
  locale = "en-US"
) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(locale, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}