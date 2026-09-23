"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { formatCalendarDateSq, formatMonthYearSq } from "@/lib/format";

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
};

function parseLocal(value: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} | null {
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

function toValue(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
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
}: DateTimeFieldProps) {
  const parsed = parseLocal(value);
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
  const minute = String(parsed?.minute ?? 0).padStart(2, "0");

  const label = parsed
    ? formatCalendarDateSq(parsed.year, parsed.month, parsed.day)
    : "Zgjidh datën";

  function commitDate(year: number, month: number, day: number) {
    onChange(toValue(year, month, day, parsed?.hour ?? 0, parsed?.minute ?? 0));
    setOpen(false);
    setCursor(null);
  }

  function commitTime(nextHour: string, nextMinute: string) {
    if (!parsed) {
      const d = new Date();
      onChange(
        toValue(
          d.getFullYear(),
          d.getMonth() + 1,
          d.getDate(),
          Number(nextHour),
          Number(nextMinute),
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
        Number(nextMinute),
      ),
    );
  }

  function shiftMonth(delta: number) {
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

  return (
    <div
      className={`field-datetime${open ? " is-open" : ""}${disabled ? " is-disabled" : ""}`}
      ref={rootRef}
    >
      <div className="field-datetime__row">
        <button
          type="button"
          id={id}
          className="field-datetime__date"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => {
            setOpen((v) => {
              if (v) {
                setCursor(null);
              }
              return !v;
            });
          }}
        >
          <span>{label}</span>
          <span className="field-datetime__icon" aria-hidden>
            ▾
          </span>
        </button>

        <div className="field-datetime__time" aria-label="Ora">
          <SelectField
            value={hour}
            onChange={(h) => commitTime(h, minute)}
            options={HOUR_OPTIONS}
            disabled={disabled}
            aria-label="Ora"
          />
          <span className="field-datetime__sep" aria-hidden>
            :
          </span>
          <SelectField
            value={minute}
            onChange={(m) => commitTime(hour, m)}
            options={MINUTE_OPTIONS}
            disabled={disabled}
            aria-label="Minutat"
          />
        </div>
      </div>

      {open ? (
        <div
          id={panelId}
          className="field-datetime__panel"
          role="dialog"
          aria-label="Kalendari"
        >
          <div className="field-datetime__monthbar">
            <button
              type="button"
              className="field-datetime__nav"
              aria-label="Muaji i kaluar"
              onClick={() => shiftMonth(-1)}
            >
              ‹
            </button>
            <p className="field-datetime__monthlabel">
              {formatMonthYearSq(viewYear, viewMonth)}
            </p>
            <button
              type="button"
              className="field-datetime__nav"
              aria-label="Muaji tjetër"
              onClick={() => shiftMonth(1)}
            >
              ›
            </button>
          </div>

          <div className="field-datetime__weekdays">
            {WEEKDAYS.map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>

          <div className="field-datetime__grid">
            {cells.map((cell) => {
              if (cell.day === null) {
                return <span key={cell.key} className="field-datetime__empty" />;
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

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={[
                    "field-datetime__day",
                    selected ? "is-selected" : "",
                    isToday ? "is-today" : "",
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
        </div>
      ) : null}
    </div>
  );
}
