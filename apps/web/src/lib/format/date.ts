import type { Language } from "../../i18n/i18n";

// Both formats use the visitor's time zone: "Oct 28" in rows, the date with
// its time in details.
const shortDates = new Map<Language, Intl.DateTimeFormat>();
const dateTimes = new Map<Language, Intl.DateTimeFormat>();

function cached(
  cache: Map<Language, Intl.DateTimeFormat>,
  language: Language,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  let dateFormat = cache.get(language);
  if (!dateFormat) {
    dateFormat = new Intl.DateTimeFormat(language, options);
    cache.set(language, dateFormat);
  }
  return dateFormat;
}

export function formatShortDate(date: Date, language: Language): string {
  return cached(shortDates, language, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date, language: Language): string {
  return cached(dateTimes, language, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
