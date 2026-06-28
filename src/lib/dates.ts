export interface FormattedTimestamp {
  absolute: string;
  relative: string;
}

export function formatTimestamp(
  value: string,
  now = new Date(),
): FormattedTimestamp {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      absolute: "Date unavailable",
      relative: "Date unavailable",
    };
  }

  const absolute = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
  const differenceInSeconds = Math.round(
    (date.getTime() - now.getTime()) / 1000,
  );
  const divisions = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.345, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ] as const;

  let duration = differenceInSeconds;
  let unit: Intl.RelativeTimeFormatUnit = "second";
  for (const division of divisions) {
    unit = division.unit;
    if (Math.abs(duration) < division.amount) break;
    duration /= division.amount;
  }

  return {
    absolute,
    relative: new Intl.RelativeTimeFormat(undefined, {
      numeric: "auto",
    }).format(Math.round(duration), unit),
  };
}
