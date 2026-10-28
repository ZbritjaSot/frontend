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
  stack = false,
}: {
  sale: number;
  original: number;
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * default — catalog / offer detail
   * inverse — olive surfaces (sale stays ivory)
   * hero — olive hero: large lime sale, warm was-price
   */
  tone?: "default" | "inverse" | "hero";
  /** Sale and was-price on separate lines (e.g. Ending Soon rows). */
  stack?: boolean;
}) {
  const saleClass =
    size === "xl"
      ? "text-[clamp(2rem,4vw,2.8rem)]"
      : size === "lg"
        ? "text-xl"
        : size === "sm"
          ? "text-sm"
          : "text-base";

  const heroSale =
    size === "xl"
      ? "text-[clamp(2.8rem,7vw,3.6rem)]"
      : size === "lg"
        ? "text-[clamp(2.4rem,6vw,3rem)]"
        : saleClass;

  const saleTone =
    tone === "inverse" ? "text-ivory" : "text-accent";
  const saleOutline = tone === "inverse" ? "" : "sale-price-outline";

  return (
    <span
      className={
        stack
          ? "flex min-w-0 flex-col items-end gap-0.5"
          : "flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5"
      }
    >
      <span
        className={`${tone === "hero" ? heroSale : saleClass} leading-none font-extrabold tabular-nums ${saleTone} ${saleOutline}`}
      >
        {formatEurFromCents(sale)}
      </span>
      {original > sale ? (
        <span
          className={`text-was line-through tabular-nums ${
            tone === "hero" ? "text-lg sm:text-xl" : "text-sm"
          }`}
        >
          {formatEurFromCents(original)}
        </span>
      ) : null}
    </span>
  );
}
