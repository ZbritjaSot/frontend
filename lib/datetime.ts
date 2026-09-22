/** Datetime helpers for HTML datetime-local ↔ API ISO. */

/** API ISO / Date → value for `<input type="datetime-local" />`. */
export function toDateTimeLocalValue(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** datetime-local string → ISO for Laravel. */
export function fromDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

export function defaultOfferWindow(): { starts_at: string; expires_at: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 14);
  return {
    starts_at: toDateTimeLocalValue(start),
    expires_at: toDateTimeLocalValue(end),
  };
}
