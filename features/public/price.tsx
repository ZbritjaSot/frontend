import { useId } from "react";
import { formatDiscountPercent, formatEurFromCents } from "@/lib/format";

/** Four fixed families. -25% stays green and -26% is orange. */
const DISCOUNT_BANDS = [
  { max: 25, from: "#49C447", to: "#08752D" },
  { max: 50, from: "#FFC02E", to: "#E96800" },
  { max: 75, from: "#FF494F", to: "#D91F35" },
  { max: 100, from: "#C91835", to: "#870D25" },
] as const;

function discountBand(percent: number): { from: string; to: string } {
  const shown = Math.min(100, Math.max(0, Math.round(percent)));
  return DISCOUNT_BANDS.find((band) => shown <= band.max) ?? DISCOUNT_BANDS[3];
}

function mixHex(from: string, to: string, t: number): string {
  const read = (hex: string) => {
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  };

  const [ar, ag, ab] = read(from);
  const [br, bg, bb] = read(to);

  const channel = (a: number, b: number) => Math.round(a + (b - a) * t);

  return `#${[channel(ar, br), channel(ag, bg), channel(ab, bb)]
    .map((part) => part.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Organic leaf-shaped corner.
 * Keep this shape unchanged.
 * ViewBox: 120 × 108.
 */
const BADGE_SHAPE =
  "M-2 0H88C101 0 109 5 107 13C105 19 100 24 94 29C89 33 83 37 79 42C75 47 76 51 70 55C63 60 52 65 42 70C35 75 30 79 20 80C14 82 7 81 3 81C1 81 0 82 -1 82V-2Z";

/** Fine outer rim following the badge contour. */
const BADGE_RIM =
  "M88 1.3 C96 1.6 102 4.4 104 8.3 C106 11.5 104 15.7 101 19.5 C98 23.2 94 26.8 90 30.2 C86 33.8 82 37.2 79 41.2 C76 45 76 48 73 51 C70 54 66 56.5 62 59 C56.5 62.3 52 65.8 47.5 69.4 C43.5 72.6 39.3 75.5 34.3 77.4 C29.7 79.1 24.5 79.7 19.2 80 C12.5 80.4 6.2 80.5 1 80.7 L1 79.7 C7.5 79.4 13.4 79.2 19.1 78.8 C24.3 78.5 29.1 77.9 33.8 76.2 C38.5 74.4 42.5 71.4 46.7 68.1 C51.3 64.4 56.2 60.8 62 57.3 C65.9 55 69.6 52.7 72.1 50 C74.5 47.3 75.1 44.3 78.1 40.1 C81.1 36 85.3 32.3 89.4 28.7 C93.2 25.3 97 21.8 99.7 18.3 C102.2 15 103.5 11.5 101.8 8.6 C99.8 5.3 94.3 2.4 88 2.4 Z";

/** Soft inner shadow that follows the same contour. */
const BADGE_RIM_SHADE =
  "M88.5 3.4 C94.4 3.7 99.1 5.8 101.1 8.9 C102.7 11.4 101.3 14.8 98.9 18 C96.2 21.6 92.5 25 88.7 28.4 C84.7 32 80.8 35.5 78 39.2 C75 43.2 74.6 46.2 72 49.1 C69.5 51.8 65.8 54.1 61.8 56.5 C56.4 59.8 51.6 63.4 47 67.1 C43 70.4 38.9 73.4 34 75.3 C29.3 77.1 24.1 77.6 19 77.9 C12.8 78.3 6.7 78.4 2.2 78.5 L2.2 78 C7.7 77.7 13.3 77.6 18.9 77.2 C24 76.9 29 76.4 33.5 74.7 C38.1 72.9 42.1 69.9 46.1 66.7 C50.7 63 55.6 59.4 61.3 56 C65.1 53.7 68.7 51.5 71.1 48.9 C73.4 46.3 74 43.4 77 39.1 C79.9 35.1 84 31.5 88 28 C91.8 24.6 95.5 21.2 98.1 17.8 C100.4 14.7 101.7 11.7 100.2 9.3 C98.4 6.5 93.9 4.4 88.5 4.1 Z";

/** Lower reflection following the badge's bottom-left curve. */
const BADGE_VEIN =
  "M70 55.5 C65.5 58.5 59.5 61.5 54 65.5 C49.5 69 45.5 72.5 40.5 75.2 C35.5 77.9 30 79 24 79.5 C17 80.1 9 80.3 2 80.5 C8 80.1 15 79.7 21.5 79.2 C27.5 78.8 32.5 77.9 37.5 75.5 C42 73.3 46 70 50.5 66 C56 61.5 63 58 70 55.5 Z";

/** Very fine highlight just inside the lower edge. */
const BADGE_FINE =
  "M37 76.5 C32.5 78.4 27.5 79 21.5 79.4 C15.5 79.8 9 80.1 4 80.3 C10 79.9 16 79.5 21.5 79 C27.5 78.5 32 77.7 36.5 76 Z";

/** Small glint near the upper-right shoulder. */
const BADGE_GLINT =
  "M100 6.8 C101.5 8 102.3 9.4 102.2 10.8 C102.2 12 101.7 13.1 101 14.1 C101.2 12.6 100.9 11.2 100.2 10 C99.7 9 99 8.2 98.3 7.5 Z";

/** Upper reflection shifted toward the upper-right of the badge. */
const BADGE_REFLECTION =
  "M72 3.2 C80 2.8 87 3.5 93 4.8 C99 6 103 7.6 105 9.8 C106.5 11.7 105.5 14 103.5 16 C101.5 12.8 98 10.8 92.5 9.4 C86 7.8 79 7.1 72.5 7.2 C68.5 7.3 65 8 62.5 9.2 C64.5 6.2 68 4.3 72 3.2 Z";

const cornerSize = {
  /** 56px ending-soon thumbnails. */
  xs: "w-[2.2rem]",
  /** List rows and narrow flyer thumbnails. */
  sm: "w-[2.65rem]",
  /** Catalog cards. */
  md: "w-[28%] min-w-[3.4rem] max-w-[5.25rem]",
  /** Hero and offer detail. */
  lg: "w-[22%] min-w-[4.4rem] max-w-[6.35rem]",
} as const;

/**
 * Curved top-left discount corner.
 * Place inside a relative, overflow-hidden image container.
 */
export function DiscountBadge({
  percent,
  size = "md",
}: {
  percent: number;
  size?: keyof typeof cornerSize;
}) {
  const rawId = useId().replace(/:/g, "");
  const fillId = `discount-${rawId}-fill`;
  const sheenId = `discount-${rawId}-sheen`;
  const shadeId = `discount-${rawId}-shade`;
  const rimId = `discount-${rawId}-rim`;
  const veinId = `discount-${rawId}-vein`;
  const fineId = `discount-${rawId}-fine`;
  const reflectionId = `discount-${rawId}-reflection`;

  if (!Number.isFinite(percent) || percent <= 0) {
    return null;
  }

  const band = discountBand(percent);
  const label = formatDiscountPercent(percent);
  const fontSize = label.length > 4 ? 17 : label.length > 3 ? 20 : 22;
  const rim = mixHex(band.from, "#FFFFFF", 0.62);
  const glint = mixHex(band.from, "#FFFFFF", 0.82);
  const groove = mixHex(band.to, "#0b0f0e", 0.5);

  return (
    <span
      className={`pointer-events-none absolute top-0 z-10 aspect-[120/108] ${cornerSize[size]}`}
    >
      <svg
        viewBox="0 0 120 108"
        className="size-full overflow-visible"
        role="img"
        aria-label={label}
      >
        <defs>
          <linearGradient
            id={fillId}
            x1="104"
            y1="0"
            x2="6"
            y2="104"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={band.from} />
            <stop offset="46%" stopColor={mixHex(band.from, band.to, 0.34)} />
            <stop offset="100%" stopColor={band.to} />
          </linearGradient>

          <linearGradient
            id={sheenId}
            x1="78"
            y1="0"
            x2="30"
            y2="58"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="36%" stopColor="#FFFFFF" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <linearGradient
            id={shadeId}
            x1="18"
            y1="40"
            x2="8"
            y2="104"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#0b0f0e" stopOpacity="0" />
            <stop offset="100%" stopColor="#0b0f0e" stopOpacity="0.22" />
          </linearGradient>

          <linearGradient
            id={rimId}
            x1="116"
            y1="4"
            x2="4"
            y2="104"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={glint} stopOpacity="0.15" />
            <stop offset="22%" stopColor={rim} stopOpacity="0.85" />
            <stop offset="68%" stopColor={glint} stopOpacity="1" />
            <stop offset="100%" stopColor={rim} stopOpacity="0.7" />
          </linearGradient>

          <linearGradient
            id={veinId}
            x1="56"
            y1="69"
            x2="1"
            y2="82"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={rim} stopOpacity="0" />
            <stop offset="38%" stopColor={glint} stopOpacity="0.95" />
            <stop offset="100%" stopColor={rim} stopOpacity="0.15" />
          </linearGradient>

          <linearGradient
            id={fineId}
            x1="26"
            y1="82"
            x2="2"
            y2="81"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={rim} stopOpacity="0" />
            <stop offset="45%" stopColor={glint} stopOpacity="0.75" />
            <stop offset="100%" stopColor={rim} stopOpacity="0" />
          </linearGradient>

          {/* Gradient moved with the upper reflection. */}
          <linearGradient
            id={reflectionId}
            x1="62"
            y1="4"
            x2="105"
            y2="14"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.02" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d={BADGE_SHAPE}
          fill={`url(#${fillId})`}
          style={{
            filter: "drop-shadow(0 1.5px 1.5px rgba(11,15,14,0.2))",
          }}
        />

        <path d={BADGE_SHAPE} fill={`url(#${sheenId})`} />
        <path d={BADGE_SHAPE} fill={`url(#${shadeId})`} />

        <path d={BADGE_RIM_SHADE} fill={groove} fillOpacity="0.28" />
        <path d={BADGE_RIM} fill={`url(#${rimId})`} />
        <path d={BADGE_VEIN} fill={`url(#${veinId})`} />
        <path d={BADGE_FINE} fill={`url(#${fineId})`} />

        <path d={BADGE_GLINT} fill={glint} fillOpacity="0.85" />
        <path d={BADGE_REFLECTION} fill={`url(#${reflectionId})`} />

        <text
          x="40"
          y="35"
          fill="#FFFFFF"
          fontSize={fontSize}
          fontWeight="900"
          letterSpacing="-0.045em"
          textAnchor="middle"
          dominantBaseline="central"
          transform="rotate(-32 36 31)"
          stroke={band.to}
          strokeWidth="2.5"
          strokeLinejoin="round"
          paintOrder="stroke fill"
          style={{
            fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
            filter: "drop-shadow(0 1px 1px rgba(11,15,14,0.3))",
          }}
        >
          {label}
        </text>
      </svg>
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

  const saleOutline =
    tone === "inverse" ? "" : "sale-price-outline";

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
          className={`text-was line-through tabular-nums ${tone === "hero" ? "text-lg sm:text-xl" : "text-sm"
            }`}
        >
          {formatEurFromCents(original)}
        </span>
      ) : null}
    </span>
  );
}
