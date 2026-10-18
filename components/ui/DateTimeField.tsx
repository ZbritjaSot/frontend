"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useEffect, useId, useRef, useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { formatCalendarDateSq, formatMonthYearSq } from "@/lib/format";
import { triggerClass } from "@/lib/ui";

const dayClass =
  "aspect-square cursor-pointer appearance-none rounded-md border-0 bg-transparent text-[0.8125rem] font-semibold text-ink hover:bg-slate/12 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent/55";
const navClass =
  "inline-flex size-8 cursor-pointer appearance-none items-center justify-center rounded-lg border border-line bg-elevated text-lg leading-none text-ink hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent/55";

const WEEKDAYS = ["H", "M", "M", "E", "P", "S", "D"] as const;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({
  value: String(h).padStart(2, "0"),
  label: String(h).padStart(2, "0"),
}));

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, m) => ({
  value: String(m).padStart(2, "0"),
  label: String(m).padStart(2, "0"),
}));

type DateTimeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  /** `card` shows the date, with the clock inside the calendar. */
  variant?: "row" | "card";
  caption?: string;
  /** Offer windows: hour only (`:00`). Subscriptions keep minutes. */
  hourOnly?: boolean;
  /** Calendar day only (`YYYY-MM-DD`); hides the clock. */
  dateOnly?: boolean;
  /** Inclusive upper bound as `YYYY-MM-DD` (e.g. today). */
  maxDate?: string;
  /** Inclusive lower bound as `YYYY-MM-DD` (e.g. today). */
  minDate?: string;
};

function parseLocal(
  value: string,
  dateOnly: boolean,
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} | null {
  if (dateOnly) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
      hour: 0,
      minute: 0,
    };
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function toValue(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  dateOnly: boolean,
): string {
  if (dateOnly) {
    return dayKey(year, month, day);
  }
  return `${dayKey(year, month, day)}T${pad2(hour)}:${pad2(minute)}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Monday-first index for calendar grid. */
function mondayIndex(year: number, month: number): number {
  const sundayBased = new Date(year, month - 1, 1).getDay();
  return (sundayBased + 6) % 7;
}

export function DateTimeField({
  value,
  onChange,
  disabled = false,
  id,
  "aria-label": ariaLabel,
  variant = "row",
  caption,
  hourOnly = false,
  dateOnly = false,
  maxDate,
  minDate,
}: DateTimeFieldProps) {
  const parsed = parseLocal(value, dateOnly);
  const maxParsed = maxDate ? parseLocal(maxDate, true) : null;
  const minParsed = minDate ? parseLocal(minDate, true) : null;
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  /** null = follow the selected value’s month while the panel is open. */
  const [cursor, setCursor] = useState<{ year: number; month: number } | null>(
    null,
  );

  const now = new Date();
  const viewYear = cursor?.year ?? parsed?.year ?? now.getFullYear();
  const viewMonth = cursor?.month ?? parsed?.month ?? now.getMonth() + 1;

  function isAfterMax(year: number, month: number, day: number): boolean {
    return maxDate !== undefined && dayKey(year, month, day) > maxDate;
  }

  function isBeforeMin(year: number, month: number, day: number): boolean {
    return minDate !== undefined && dayKey(year, month, day) < minDate;
  }

  function isOutOfRange(year: number, month: number, day: number): boolean {
    return isAfterMax(year, month, day) || isBeforeMin(year, month, day);
  }

  function canShiftMonth(delta: number): boolean {
    const date = new Date(viewYear, viewMonth - 1 + delta, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    if (delta > 0 && maxParsed) {
      return (
        year < maxParsed.year ||
        (year === maxParsed.year && month <= maxParsed.month)
      );
    }
    if (delta < 0 && minParsed) {
      return (
        year > minParsed.year ||
        (year === minParsed.year && month >= minParsed.month)
      );
    }
    return true;
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setCursor(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setCursor(null);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hour = String(parsed?.hour ?? 0).padStart(2, "0");
  const minute = hourOnly
    ? "00"
    : String(parsed?.minute ?? 0).padStart(2, "0");

  const label = parsed
    ? formatCalendarDateSq(parsed.year, parsed.month, parsed.day)
    : "Zgjidh datën";

  function commitDate(year: number, month: number, day: number) {
    if (isOutOfRange(year, month, day)) {
      return;
    }
    onChange(
      toValue(
        year,
        month,
        day,
        parsed?.hour ?? 0,
        hourOnly ? 0 : (parsed?.minute ?? 0),
        dateOnly,
      ),
    );
    setOpen(false);
    setCursor(null);
  }

  function commitTime(nextHour: string, nextMinute: string) {
    const minuteValue = hourOnly ? 0 : Number(nextMinute);
    if (!parsed) {
      const d = new Date();
      onChange(
        toValue(
          d.getFullYear(),
          d.getMonth() + 1,
          d.getDate(),
          Number(nextHour),
          minuteValue,
          false,
        ),
      );
      return;
    }
    onChange(
      toValue(
        parsed.year,
        parsed.month,
        parsed.day,
        Number(nextHour),
        minuteValue,
        false,
      ),
    );
  }

  function shiftMonth(delta: number) {
    if (!canShiftMonth(delta)) {
      return;
    }
    const date = new Date(viewYear, viewMonth - 1 + delta, 1);
    setCursor({ year: date.getFullYear(), month: date.getMonth() + 1 });
  }

  const leading = mondayIndex(viewYear, viewMonth);
  const totalDays = daysInMonth(viewYear, viewMonth);
  const cells: Array<{ day: number | null; key: string }> = [];
  for (let i = 0; i < leading; i += 1) {
    cells.push({ day: null, key: `pad-${i}` });
  }
  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({ day, key: `d-${day}` });
  }

  function toggle() {
    setOpen((v) => {
      if (v) {
        setCursor(null);
      }
      return !v;
    });
  }

  const timeRow = dateOnly ? null : (
    <div
      className="grid w-full max-w-[9.5rem] shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-1.5 @min-[17rem]:w-[9.5rem] [&_ul]:min-w-[4.5rem]"
      aria-label="Ora"
    >
      <SelectField
        value={hour}
        onChange={(h) => commitTime(h, hourOnly ? "00" : minute)}
        options={HOUR_OPTIONS}
        disabled={disabled}
        aria-label="Ora"
        className="justify-center! px-2! tabular-nums"
      />
      <span className="font-bold text-muted" aria-hidden>
        :
      </span>
      <SelectField
        value={minute}
        onChange={(m) => commitTime(hour, m)}
        options={hourOnly ? [{ value: "00", label: "00" }] : MINUTE_OPTIONS}
        disabled={disabled || hourOnly}
        aria-label="Minutat"
        className="justify-center! px-2! tabular-nums"
      />
    </div>
  );

  return (
    <div
      className={`@container relative w-full ${open ? "z-30" : ""}`}
      ref={rootRef}
    >
      {variant === "card" ? (
        <button
          type="button"
          id={id}
          className={`flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-xl border bg-elevated px-4 py-3 text-left outline-2 outline-offset-1 hover:border-accent/40 focus-visible:outline-accent/55 disabled:cursor-not-allowed disabled:opacity-55 ${
            open ? "border-accent/60" : "border-line"
          }`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={ariaLabel ?? caption}
          disabled={disabled}
          onClick={toggle}
        >
          {caption ? (
            <span className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
              {caption}
            </span>
          ) : null}
          <span className="text-base font-semibold text-ink">{label}</span>
          {!dateOnly ? (
            <span className="text-sm font-semibold text-muted tabular-nums">
              {hour}:{minute}
            </span>
          ) : null}
        </button>
      ) : (
        <div className="flex flex-col gap-[0.45rem] @min-[17rem]:flex-row @min-[17rem]:items-center">
          <button
            type="button"
            id={id}
            className={`${triggerClass} @min-[17rem]:w-auto @min-[17rem]:min-w-0 @min-[17rem]:flex-1`}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={toggle}
          >
            <span>{label}</span>
            <KeyboardArrowDownIcon
              fontSize="small"
              className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          {timeRow}
        </div>
      )}

      {open ? (
        <div
          id={panelId}
          className="absolute top-[calc(100%+0.35rem)] left-0 z-[45] w-[min(100%,18.5rem)] rounded-lg border border-line bg-elevated p-3.5 shadow-[0_12px_32px_var(--color-shadow)]"
          role="dialog"
          aria-label="Kalendari"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className={navClass}
              aria-label="Muaji i kaluar"
              disabled={!canShiftMonth(-1)}
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeftIcon fontSize="small" />
            </button>
            <p className="m-0 text-sm font-bold text-ink capitalize">
              {formatMonthYearSq(viewYear, viewMonth)}
            </p>
            <button
              type="button"
              className={navClass}
              aria-label="Muaji tjetër"
              disabled={!canShiftMonth(1)}
              onClick={() => shiftMonth(1)}
            >
              <ChevronRightIcon fontSize="small" />
            </button>
          </div>

          <div className="mb-1.5 grid grid-cols-7 gap-0.5 text-center text-[0.6875rem] font-bold text-muted">
            {WEEKDAYS.map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell) => {
              if (cell.day === null) {
                return <span key={cell.key} className="aspect-square" />;
              }

              const selected =
                parsed !== null &&
                parsed.year === viewYear &&
                parsed.month === viewMonth &&
                parsed.day === cell.day;

              const isToday =
                now.getFullYear() === viewYear &&
                now.getMonth() + 1 === viewMonth &&
                now.getDate() === cell.day;

              const blocked = isOutOfRange(viewYear, viewMonth, cell.day);

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={blocked}
                  aria-disabled={blocked}
                  className={[
                    dayClass,
                    isToday
                      ? "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-accent)_55%,transparent)]"
                      : "",
                    selected ? "bg-accent text-on-accent" : "",
                    blocked
                      ? "cursor-not-allowed text-muted/40 hover:bg-transparent"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => commitDate(viewYear, viewMonth, cell.day!)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
          {variant === "card" && timeRow ? (
            <div className="mt-3 flex justify-center border-t border-line pt-3">
              {timeRow}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
