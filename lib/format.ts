/** Shared money / date helpers (EUR, Albanian locale). */

const eurFormatter = new Intl.NumberFormat("sq-AL", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("sq-AL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("sq-AL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Format a number or numeric string as EUR (e.g. `1,40 €`). */
export function formatEur(value: number | string): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) {
    return "—";
  }
  return eurFormatter.format(amount);
}

/** Discount percent label, e.g. `-30%`. */
export function formatDiscountPercent(percent: number): string {
  if (!Number.isFinite(percent)) {
    return "";
  }
  return `-${Math.round(percent)}%`;
}

/** Long Albanian date. */
export function formatDateSq(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return dateFormatter.format(date);
}

/** Short numeric date for tables. */
export function formatDateShortSq(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return shortDateFormatter.format(date);
}
