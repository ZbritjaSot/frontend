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
    <div className="relative w-full" ref={rootRef}>
      <div className="flex flex-col gap-[0.45rem]">
        <button
          type="button"
          id={id}
          className={triggerClass}
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
          <KeyboardArrowDownIcon
            fontSize="small"
            className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className="grid max-w-[9.5rem] grid-cols-[1fr_auto_1fr] items-center gap-1.5 [&_ul]:min-w-[4.5rem]"
          aria-label="Ora"
        >
          <SelectField
            value={hour}
            onChange={(h) => commitTime(h, minute)}
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
            options={MINUTE_OPTIONS}
            disabled={disabled}
            aria-label="Minutat"
            className="justify-center! px-2! tabular-nums"
          />
        </div>
      </div>

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

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={[
                    dayClass,
                    isToday
                      ? "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-accent)_55%,transparent)]"
                      : "",
                    selected ? "bg-accent text-on-accent" : "",
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
