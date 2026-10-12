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

/** Offer windows: local datetime snapped to the hour (`:00`). */
export function toHourLocalValue(value: string | Date): string {
  const local = toDateTimeLocalValue(value);
  if (!local) {
    return "";
  }
  return `${local.slice(0, 14)}00`;
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

/** Offer datetime-local → ISO, forced to the start of the local hour. */
export function fromHourLocalValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

/** Minimum hours between now and offer/flyer start (review buffer). */
export const OFFER_START_LEAD_HOURS = 2;

/**
 * Earliest allowed start: now + lead, then ceiled to the next hour if needed
 * (offer times are hour-only).
 */
export function earliestOfferStart(from: Date = new Date()): Date {
  const min = new Date(from.getTime());
  min.setHours(min.getHours() + OFFER_START_LEAD_HOURS);
  if (
    min.getMinutes() > 0 ||
    min.getSeconds() > 0 ||
    min.getMilliseconds() > 0
  ) {
    min.setHours(min.getHours() + 1, 0, 0, 0);
  } else {
    min.setMinutes(0, 0, 0);
  }
  return min;
}

/** Default create window: earliest allowed start → +14 days (same hour). */
export function defaultOfferWindow(): {
  starts_at: string;
  expires_at: string;
} {
  const start = earliestOfferStart();
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 14);
  return {
    starts_at: toHourLocalValue(start),
    expires_at: toHourLocalValue(end),
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
