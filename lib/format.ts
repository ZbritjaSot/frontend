/** Shared money / date helpers (EUR, Albanian locale). */

/** Soft ceil for POS amounts (€1_000_000.00 in cents). */
export const MAX_PRICE_CENTS = 100_000_000;

/** Kosovo uses Central European Time (same zone as Belgrade). */
const KOSOVO_TIME_ZONE = "Europe/Belgrade";

export const MONTHS_SQ = [
  "janar",
  "shkurt",
  "mars",
  "prill",
  "maj",
  "qershor",
  "korrik",
  "gusht",
  "shtator",
  "tetor",
  "nëntor",
  "dhjetor",
] as const;

/** Format a number or numeric string as EUR (e.g. `1,40 €`). */
export function formatEur(value: number | string): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) {
    return "—";
  }
  const negative = amount < 0;
  const [whole, frac] = Math.abs(amount).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}${grouped},${frac} €`;
}

/** Format integer cents as EUR (e.g. `5000` → `50,00 €`). */
export function formatEurFromCents(cents: number | string): string {
  const amount = typeof cents === "string" ? Number(cents) : cents;
  if (!Number.isFinite(amount)) {
    return "—";
  }
  return formatEur(amount / 100);
}

/** Euros decimal string/number → integer cents (e.g. `50.00` → `5000`). */
export function eurosToCents(value: number | string): number {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) {
    return NaN;
  }
  return Math.round(amount * 100);
}

/** Integer cents → euros input string (e.g. `5000` → `50.00`). */
export function centsToEurosInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Discount percent label, e.g. `-30%`. */
export function formatDiscountPercent(percent: number): string {
  if (!Number.isFinite(percent)) {
    return "";
  }
  return `-${Math.round(percent)}%`;
}

/** Long Albanian date, e.g. `22 shtator 2026`. */
export function formatDateSq(value: string | Date): string {
  const parts = kosovoParts(value);
  if (!parts) {
    return "—";
  }
  return `${Number(parts.day)} ${MONTHS_SQ[Number(parts.month) - 1]} ${parts.year}`;
}

/** Short numeric date, e.g. `22.09.2026`. */
export function formatDateShortSq(value: string | Date): string {
  const parts = kosovoParts(value);
  if (!parts) {
    return "—";
  }
  return `${parts.day}.${parts.month}.${parts.year}`;
}

/** Short date + time, e.g. `22.09.2026 14:05`. */
export function formatDateTimeShortSq(value: string | Date): string {
  const parts = kosovoParts(value);
  if (!parts) {
    return "—";
  }
  return `${parts.day}.${parts.month}.${parts.year} ${parts.hour}:${parts.minute}`;
}

/** Calendar day already chosen in the form, e.g. `22 shtator 2026`. */
export function formatCalendarDateSq(
  year: number,
  month: number,
  day: number,
): string {
  const name = MONTHS_SQ[month - 1];
  if (!name) {
    return "—";
  }
  return `${day} ${name} ${year}`;
}

/** Calendar heading, e.g. `Shtator 2026`. */
export function formatMonthYearSq(year: number, month: number): string {
  const name = MONTHS_SQ[month - 1];
  if (!name) {
    return "—";
  }
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

type KosovoParts = {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
};

function kosovoParts(value: string | Date): KosovoParts | null {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KOSOVO_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const day = read("day").padStart(2, "0");
  const month = read("month").padStart(2, "0");
  const year = read("year");
  const hour = read("hour").padStart(2, "0");
  const minute = read("minute").padStart(2, "0");

  if (!day || !month || !year) {
    return null;
  }

  return { day, month, year, hour, minute };
}
