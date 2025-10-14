export const APP_TIME_ZONE = "Asia/Bangkok";

const apiFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const offsetFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function getDatePartsInTimeZone(date: Date) {
  const parts = apiFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to format date for timezone");
  }

  return { year, month, day };
}

export function formatDateForApi(date: Date) {
  const { year, month, day } = getDatePartsInTimeZone(date);
  return `${year}-${month}-${day}`;
}

export function parseDateToUtcFromTimeZone(input: string | Date) {
  const parsed = typeof input === "string" ? new Date(input) : new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date value");
  }

  const { year, month, day } = getDatePartsInTimeZone(parsed);
  const utcMidnight = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  const offsetValues = offsetFormatter
    .formatToParts(utcMidnight)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  if (!offsetValues.year || !offsetValues.month || !offsetValues.day) {
    throw new Error("Failed to resolve timezone offset");
  }

  const zonedAsUtc = Date.UTC(
    Number(offsetValues.year),
    Number(offsetValues.month) - 1,
    Number(offsetValues.day),
    Number(offsetValues.hour ?? 0),
    Number(offsetValues.minute ?? 0),
    Number(offsetValues.second ?? 0)
  );

  const offsetMinutes = (zonedAsUtc - utcMidnight.getTime()) / 60000;
  utcMidnight.setUTCMinutes(utcMidnight.getUTCMinutes() - offsetMinutes);
  utcMidnight.setUTCSeconds(0, 0);

  return utcMidnight;
}

export function formatDateForDisplay(
  input: string | Date,
  locale?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions
) {
  const parsed = typeof input === "string" ? new Date(input) : new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    ...(options ?? {}),
  }).format(parsed);
}
