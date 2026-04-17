import type { ActivityItem } from "../types/Activity";

const DATE_RANGE_SEPARATOR = " \u2013 ";
const monthLabelFormatterCache = new Map<string, Intl.DateTimeFormat>();

const normalizeLegacyDateLabel = (value: string) =>
  value.trim().replace(/\s+/g, " ").replace(/^sept\b/i, "Sep");

const isMonthValue = (value: string | undefined | null): value is string =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

const parseMonthValue = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, 1);
};

const getMonthLabelFormatter = (locale: string) => {
  const cachedFormatter = monthLabelFormatterCache.get(locale);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  monthLabelFormatterCache.set(locale, formatter);
  return formatter;
};

const formatMonthValue = (value: string, locale: string) =>
  getMonthLabelFormatter(locale).format(new Date(parseMonthValue(value)));

const parseLegacyDatePart = (value: string) => {
  const normalizedValue = normalizeLegacyDateLabel(value);

  if (/^\d{4}$/.test(normalizedValue)) {
    return Date.UTC(Number(normalizedValue), 11, 31, 23, 59, 59, 999);
  }

  const parsedMonthYear = Date.parse(`1 ${normalizedValue}`);

  if (Number.isFinite(parsedMonthYear)) {
    return parsedMonthYear;
  }

  const parsedDate = Date.parse(normalizedValue);

  if (Number.isFinite(parsedDate)) {
    return parsedDate;
  }

  return Number.NEGATIVE_INFINITY;
};

const getLegacyDateSortValue = (value: string) => {
  const parts = value
    .split(/\s+(?:\u2013|-)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return Number.NEGATIVE_INFINITY;
  }

  const lastPart = parts[parts.length - 1] || parts[0];
  return parseLegacyDatePart(lastPart);
};

export const formatActivityDateLabel = ({
  start_date,
  end_date,
  fallbackDate,
  locale,
}: {
  start_date?: string;
  end_date?: string;
  fallbackDate?: string;
  locale?: string;
}) => {
  const resolvedLocale = locale?.trim() || "en-US";
  const hasValidStart = isMonthValue(start_date);
  const hasValidEnd = isMonthValue(end_date);

  if (hasValidStart && hasValidEnd) {
    if (parseMonthValue(end_date) < parseMonthValue(start_date)) {
      return formatMonthValue(start_date, resolvedLocale);
    }

    if (start_date === end_date) {
      return formatMonthValue(start_date, resolvedLocale);
    }

    return `${formatMonthValue(start_date, resolvedLocale)}${DATE_RANGE_SEPARATOR}${formatMonthValue(end_date, resolvedLocale)}`;
  }

  if (hasValidStart) {
    return formatMonthValue(start_date, resolvedLocale);
  }

  return fallbackDate?.trim() ?? "";
};

export const getActivitySortValue = (
  activity: Pick<ActivityItem, "date" | "start_date" | "end_date">
) => {
  if (isMonthValue(activity.end_date)) {
    return parseMonthValue(activity.end_date);
  }

  if (isMonthValue(activity.start_date)) {
    return parseMonthValue(activity.start_date);
  }

  return getLegacyDateSortValue(activity.date);
};

export const compareActivitiesByDateDesc = (
  left: Pick<ActivityItem, "date" | "start_date" | "end_date">,
  right: Pick<ActivityItem, "date" | "start_date" | "end_date">
) => getActivitySortValue(right) - getActivitySortValue(left);
