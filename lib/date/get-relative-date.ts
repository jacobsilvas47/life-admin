export function getRelativeDate(dateString: string) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const target = new Date(dateString);

  target.setHours(0, 0, 0, 0);

  const diff =
    Math.round(
      (target.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  if (diff < 0) {
    return {
      text: `Overdue by ${Math.abs(diff)} day${
        Math.abs(diff) === 1 ? "" : "s"
      }`,
      priority: "high",
    };
  }

  if (diff === 0) {
    return {
      text: "Due today",
      priority: "high",
    };
  }

  if (diff <= 7) {
    return {
      text: `Due in ${diff} day${diff === 1 ? "" : "s"}`,
      priority: "high",
    };
  }

  if (diff <= 30) {
    return {
      text: `Due in ${diff} days`,
      priority: "medium",
    };
  }

  return {
    text: `Due in ${diff} days`,
    priority: "low",
  };
}