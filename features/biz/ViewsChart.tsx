"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatCalendarDateSq } from "@/lib/format";
import type { OfferViewDay } from "@/types";

const WEEKDAYS_SQ = ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"] as const;

type ViewsChartProps = {
  days: OfferViewDay[];
};

export function ViewsChart({ days }: ViewsChartProps) {
  return (
    <div className="h-64 w-full px-2 pt-2 pb-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={days} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="offer-views-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="3 6"
          />
          <XAxis
            dataKey="date"
            tickFormatter={dayNumber}
            minTickGap={28}
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            width={36}
            domain={[0, (max: number) => Math.max(max, 1)]}
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={ViewsTooltip}
            cursor={{ stroke: "var(--color-accent)", strokeDasharray: "3 4" }}
            allowEscapeViewBox={{ x: false, y: true }}
          />
          <Area
            type="monotone"
            dataKey="views"
            name="Hapje"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            fill="url(#offer-views-fill)"
            activeDot={{ r: 5, fill: "var(--color-accent)", stroke: "var(--color-bg)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ViewsTooltip({ active, payload }: TooltipContentProps) {
  const day = payload[0]?.payload;
  if (!active || !isViewDay(day)) {
    return null;
  }

  const parsed = parseDay(day.date);

  return (
    <div className="rounded-xl border border-line bg-elevated px-3 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
      {parsed ? (
        <>
          <p className="m-0 text-[0.65rem] font-bold tracking-[0.14em] text-muted uppercase">
            {weekdaySq(parsed.year, parsed.month, parsed.day)}
          </p>
          <p className="m-0 mt-0.5 text-sm font-semibold">
            {formatCalendarDateSq(parsed.year, parsed.month, parsed.day)}
          </p>
        </>
      ) : null}
      <p className="m-0 mt-1 text-lg leading-none font-extrabold text-accent tabular-nums">
        {day.views}
      </p>
      <p className="m-0 mt-0.5 text-xs text-muted">hapje</p>
    </div>
  );
}

function isViewDay(value: unknown): value is OfferViewDay {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const day = value as { date?: unknown; views?: unknown };
  return typeof day.date === "string" && typeof day.views === "number";
}

function parseDay(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return null;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function dayNumber(iso: string): string {
  return parseDay(iso)?.day.toString() ?? "";
}

function weekdaySq(year: number, month: number, day: number): string {
  const index = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return WEEKDAYS_SQ[index] ?? "";
}
