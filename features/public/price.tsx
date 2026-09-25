import { formatDiscountPercent, formatEurFromCents } from "@/lib/format";

export function DiscountBadge({ percent }: { percent: number }) {
  if (!Number.isFinite(percent) || percent <= 0) {
    return null;
  }

  return (
    <span className="inline-flex rounded-full bg-accent px-2 py-0.5 text-[0.7rem] leading-none font-extrabold tracking-tight text-charcoal tabular-nums">
      {formatDiscountPercent(percent)}
    </span>
  );
}

export function PriceLine({
  sale,
  original,
  size = "md",
  tone = "default",
}: {
  sale: number;
  original: number;
  size?: "sm" | "md" | "lg" | "xl";
  /** Inverse is for a forest surface, where the sale price stays ivory. */
  tone?: "default" | "inverse";
}) {
  const saleClass =
    size === "xl"
      ? "text-[clamp(2rem,4vw,2.8rem)]"
      : size === "lg"
        ? "text-xl"
        : size === "sm"
          ? "text-sm"
          : "text-base";

  return (
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span
        className={`${saleClass} leading-none font-extrabold tabular-nums ${
          tone === "inverse" ? "text-ivory" : "text-ink dark:text-accent"
        }`}
      >
        {formatEurFromCents(sale)}
      </span>
      {original > sale ? (
        <span
          className={`text-sm line-through tabular-nums ${
            tone === "inverse" ? "text-ivory/80" : "text-muted"
          }`}
        >
          {formatEurFromCents(original)}
        </span>
      ) : null}
    </span>
  );
}
