/** Datetime helpers for HTML datetime-local ↔ API ISO. */

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar day at 00:00 (used for create defaults). */
export function startOfLocalDay(value: Date = new Date()): Date {
  const date = new Date(value.getTime());
  date.setHours(0, 0, 0, 0);
  return date;
}

/** API ISO / Date → value for `<input type="datetime-local" />`. */
export function toDateTimeLocalValue(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Date → datetime-local at local midnight (00:00). */
export function toDateTimeLocalMidnight(value: string | Date = new Date()): string {
  return toDateTimeLocalValue(startOfLocalDay(
    typeof value === "string" ? new Date(value) : value,
  ));
}

/** datetime-local string → ISO for Laravel. */
export function fromDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

/**
 * Default create window: today 00:00 → +14 days 00:00.
 * Time stays editable for minute-precise offers; defaults avoid "now".
 */
export function defaultOfferWindow(): {
  starts_at: string;
  expires_at: string;
} {
  const start = startOfLocalDay();
  const end = startOfLocalDay();
  end.setDate(end.getDate() + 14);
  return {
    starts_at: toDateTimeLocalValue(start),
    expires_at: toDateTimeLocalValue(end),
  };
}

/** Lengths offered when recording a payment. Other spans stay on the calendars. */
export const SUBSCRIPTION_LENGTHS = [1, 3, 6, 12] as const;

export type SubscriptionLength = (typeof SUBSCRIPTION_LENGTHS)[number];

/**
 * Add calendar months in local time. A short month keeps the last day,
 * so 31 January plus one month is 28 or 29 February.
 */
export function addLocalMonths(value: string, months: number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const day = date.getDate();
  const next = new Date(date.getTime());
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return toDateTimeLocalValue(next);
}

/** A new payment starts today at midnight and runs one month. */
export function defaultSubscriptionWindow(): {
  starts_at: string;
  ends_at: string;
} {
  const starts_at = toDateTimeLocalValue(startOfLocalDay());
  return { starts_at, ends_at: addLocalMonths(starts_at, 1) };
}

export function subscriptionLengthLabel(months: SubscriptionLength): string {
  return months === 12 ? "1 vit" : `${months} muaj`;
}
