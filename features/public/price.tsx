import { formatDiscountPercent, formatEurFromCents } from "@/lib/format";

type Rgb = [number, number, number];

/** Leaf → burnt orange → light red → wine. Stops blend so nearby percents don't snap. */
const DISCOUNT_STOPS: { at: number; rgb: Rgb }[] = [
  { at: 0, rgb: [27, 122, 67] },
  { at: 25, rgb: [47, 155, 87] },
  { at: 50, rgb: [224, 122, 31] },
  { at: 75, rgb: [225, 91, 85] },
  { at: 100, rgb: [122, 21, 34] },
];

const IVORY: Rgb = [246, 243, 234];

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function rgbCss(color: Rgb): string {
  return `rgb(${color[0]} ${color[1]} ${color[2]})`;
}

function discountTone(percent: number): { base: string; sheen: string } {
  const value = Math.min(100, Math.max(0, percent));
  let index = 0;
  while (index < DISCOUNT_STOPS.length - 2 && value > DISCOUNT_STOPS[index + 1].at) {
    index += 1;
  }
  const left = DISCOUNT_STOPS[index];
  const right = DISCOUNT_STOPS[index + 1];
  const span = right.at - left.at;
  const t = span === 0 ? 0 : (value - left.at) / span;
  const base = mix(left.rgb, right.rgb, t);
  return { base: rgbCss(base), sheen: rgbCss(mix(base, IVORY, 0.22)) };
}

const cornerSize = {
  /** 56px ending-soon thumbs. The shared small size would cover the photo. */
  xs: "size-[2.4rem] text-[0.5rem]",
  sm: "size-[3.25rem] text-[0.68rem]",
  md: "size-[4.25rem] text-[0.78rem]",
  lg: "size-[5.75rem] text-[0.95rem]",
} as const;

/**
 * Folded top-left corner on a product photo. Place inside a relative, overflow-hidden image.
 */
export function DiscountBadge({
  percent,
  size = "md",
}: {
  percent: number;
  size?: keyof typeof cornerSize;
}) {
  if (!Number.isFinite(percent) || percent <= 0) {
    return null;
  }

  const tone = discountTone(percent);
  const label = formatDiscountPercent(percent);

  return (
    <span
      className={`pointer-events-none absolute top-0 left-0 z-10 overflow-hidden ${cornerSize[size]}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-[rgba(11,15,14,0.38)]"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
          background: `linear-gradient(135deg, ${tone.sheen} 0%, ${tone.base} 74%)`,
        }}
      />
      <span
        aria-hidden
        className="absolute top-0 right-0 h-px w-[141.42%] origin-top-right -rotate-45 bg-ivory/80"
      />
      <span
        className="absolute leading-none font-extrabold tracking-tight whitespace-nowrap text-ivory tabular-nums [text-shadow:0_1px_1px_rgba(11,15,14,0.4)]"
        style={{ left: "32%", top: "32%", transform: "translate(-50%, -50%) rotate(-45deg)" }}
      >
        {label}
      </span>
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
