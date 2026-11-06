import { formatDiscountPercent, formatEurFromCents } from "@/lib/format";

/**
 * Four fixed families. -25% stays green and -26% is orange. `text` is
 * white on every band per product decision — note the 50%/75% bands
 * (light yellow/orange) measure only ~1.3:1 and ~1.6:1 contrast against
 * white, well under WCAG AA. Keep in sync with mobile's `DISCOUNT_BANDS`
 * in `src/components/visuals.tsx` — same colors, same text.
 */
const DISCOUNT_BANDS = [
  { max: 25, from: "#2C862B", to: "#08752D", text: "text-white" },
  { max: 50, from: "#FFE066", to: "#F5B800", text: "text-white" },
  { max: 75, from: "#FFC02E", to: "#E96800", text: "text-white" },
  { max: 100, from: "#E0263B", to: "#C21A31", text: "text-white" },
] as const;

function discountBand(percent: number): { from: string; to: string; text: string } {
  const shown = Math.min(100, Math.max(0, Math.round(percent)));
  return DISCOUNT_BANDS.find((band) => shown <= band.max) ?? DISCOUNT_BANDS[3];
}

/**
 * Original rounded-pill mark (pre-dates `DiscountRail`'s gradient bar) —
 * only for the product detail page's main/featured image, top-left corner.
 * Flat fill, not a gradient: uses `DISCOUNT_BANDS`' `from` color per band
 * (the updated PO-approved palette) instead of the old flat `bg-accent`,
 * but keeps the pill's original shape/size and single-color fill. Do not
 * use this anywhere `DiscountRail` is already used — that's unchanged.
 */
export function DiscountBadge({ percent }: { percent: number }) {
  if (!Number.isFinite(percent) || percent <= 0) {
    return null;
  }

  const band = discountBand(percent);

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] leading-none font-extrabold tracking-tight tabular-nums ${band.text}`}
      style={{ backgroundColor: band.from }}
    >
      {formatDiscountPercent(percent)}
    </span>
  );
}

const railSize = {
  /** 56px ending-soon thumbnails. */
  xs: { height: "h-[16px]", text: "text-[8px]" },
  /** List rows and narrow flyer thumbnails. */
  sm: { height: "h-[20px]", text: "text-[10px]" },
  /** Currently unused by any call site — every former default-md spot was bumped to lg per PO. Kept for any future narrower card that still wants the smaller size. */
  md: { height: "h-[28px]", text: "text-[13px]" },
  /**
   * Bumped up from md per PO: catalog cards, hero, offer detail, Exclusive
   * cards, and every campaign/flyer layout ("feature"/"card"/"editorial"/
   * "rail") — i.e. every prominent card, not just the first one in a grid.
   */
  lg: { height: "h-[40px]", text: "text-[18px]" },
} as const;

/**
 * Flat gradient rail flush to the bottom edge ("Side Rail" concept,
 * mounted along the bottom instead of the side — horizontal text, no rotation).
 * Place inside a relative, overflow-hidden image container.
 */
export function DiscountRail({
  percent,
  size = "md",
}: {
  percent: number;
  size?: keyof typeof railSize;
}) {
  if (!Number.isFinite(percent) || percent <= 0) {
    return null;
  }

  const band = discountBand(percent);
  const label = formatDiscountPercent(percent);
  const { height, text: textSize } = railSize[size];

  return (
    <span
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center font-extrabold tracking-[0.03em] ${height} ${textSize} ${band.text}`}
      style={{ background: `linear-gradient(135deg, ${band.from}, ${band.to})` }}
      role="img"
      aria-label={label}
    >
      {label}
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
   * default — catalog / offer detail (deep green on cream, lime in dark mode)
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
    tone === "inverse" ? "text-ivory" : tone === "hero" ? "text-accent" : "text-sale";

  return (
    <span
      className={
        stack
          ? "flex min-w-0 flex-col items-end gap-0.5"
          : "flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5"
      }
    >
      <span
        className={`${tone === "hero" ? heroSale : saleClass} leading-none font-extrabold tabular-nums ${saleTone}`}
      >
        {formatEurFromCents(sale)}
      </span>

      {original > sale ? (
        <span
          className={`${tone === "hero" ? "text-[#e09286]" : "text-was"} line-through tabular-nums ${tone === "hero" ? "text-lg sm:text-xl" : "text-sm"
            }`}
        >
          {formatEurFromCents(original)}
        </span>
      ) : null}
    </span>
  );
}
