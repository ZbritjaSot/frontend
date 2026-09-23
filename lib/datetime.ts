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

/** Same midnight window for subscription create forms. */
export function defaultSubscriptionWindow(): {
  starts_at: string;
  ends_at: string;
} {
  const { starts_at, expires_at } = defaultOfferWindow();
  return { starts_at, ends_at: expires_at };
}
