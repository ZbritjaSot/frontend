import Link from "next/link";
import type { ReactNode } from "react";

const valueTone = {
  ink: "text-ink",
  pending: "text-pending",
  danger: "text-danger",
  accent: "text-accent",
} as const;

export function IndicatorLink({
  href,
  icon,
  label,
  value,
  hint,
  tone = "ink",
  badgeLabel,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value?: string | number | null;
  hint?: string | null;
  tone?: keyof typeof valueTone;
  badgeLabel: string;
}) {
  const hasValue = value != null && value !== "";

  return (
    <Link
      href={href}
      aria-label={badgeLabel}
      className="flex h-full min-h-36 flex-col justify-between gap-6 rounded-2xl border border-line p-5 text-inherit no-underline hover:border-accent/60"
    >
      <span className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-sunken text-ink">
        {icon}
      </span>
      <span className="grid min-w-0 gap-1.5">
        {hasValue ? (
          <span
            className={`text-3xl leading-none font-bold tracking-[-0.03em] tabular-nums ${valueTone[tone]}`}
          >
            {value}
          </span>
        ) : null}
        <span
          className={
            hasValue
              ? "truncate text-sm font-semibold text-muted"
              : "truncate text-lg font-bold text-ink"
          }
        >
          {label}
        </span>
        {hint ? <span className="truncate text-sm text-muted">{hint}</span> : null}
      </span>
    </Link>
  );
}
