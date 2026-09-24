import Image from "next/image";
import { shopInitials } from "@/features/public/initials";

const WASHES = [
  "bg-[#d5e4c4] dark:bg-[#243628]",
  "bg-[#eadcc4] dark:bg-[#322c22]",
  "bg-[#d4e2dc] dark:bg-[#1c3038]",
  "bg-[#efe0c4] dark:bg-[#3a2e22]",
  "bg-[#dde3cc] dark:bg-[#2a3324]",
  "bg-[#cfe0d4] dark:bg-[#1e3330]",
] as const;

const STRIPES = [
  "bg-[linear-gradient(128deg,transparent_56%,rgba(168,255,0,0.45)_56%,rgba(168,255,0,0.45)_61%,transparent_61%)]",
  "bg-[linear-gradient(210deg,transparent_64%,rgba(168,255,0,0.28)_64%,rgba(168,255,0,0.28)_74%,transparent_74%)]",
  "bg-[linear-gradient(150deg,transparent_48%,rgba(11,15,14,0.08)_48%,rgba(11,15,14,0.08)_52%,transparent_52%)] dark:bg-[linear-gradient(150deg,transparent_48%,rgba(168,255,0,0.2)_48%,rgba(168,255,0,0.2)_52%,transparent_52%)]",
  "bg-[linear-gradient(100deg,transparent_70%,rgba(168,255,0,0.35)_70%,rgba(168,255,0,0.35)_78%,transparent_78%)]",
  "bg-[linear-gradient(168deg,transparent_42%,rgba(168,255,0,0.22)_42%,rgba(168,255,0,0.22)_46%,transparent_46%)]",
  "bg-[linear-gradient(230deg,transparent_60%,rgba(11,15,14,0.06)_60%,rgba(11,15,14,0.06)_68%,transparent_68%)] dark:bg-[linear-gradient(230deg,transparent_60%,rgba(168,255,0,0.18)_60%,rgba(168,255,0,0.18)_68%,transparent_68%)]",
] as const;

function washIndex(name: string): number {
  let hash = 0;
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % WASHES.length;
  }
  return hash;
}

const LOGO_SIZE = {
  sm: "size-10 rounded-xl text-sm",
  md: "size-12 rounded-2xl text-base",
  lg: "size-16 rounded-[1.25rem] text-xl",
  xl: "size-24 rounded-[1.6rem] text-3xl",
} as const;

/** Shop mark. Initials until the shop has a logo. The name sits beside it, so the image stays decorative. */
export function ShopLogo({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl?: string | null;
  size?: keyof typeof LOGO_SIZE;
}) {
  const frame = `inline-grid shrink-0 place-items-center overflow-hidden bg-charcoal font-extrabold tracking-tight text-accent ring-1 ring-white/10 dark:bg-[#18211c] dark:ring-accent/25 ${LOGO_SIZE[size]}`;

  if (logoUrl) {
    return (
      <span aria-hidden className={`relative ${frame}`}>
        <Image src={logoUrl} alt="" fill unoptimized className="object-cover" sizes="96px" />
      </span>
    );
  }

  return (
    <span aria-hidden className={frame}>
      {shopInitials(name)}
    </span>
  );
}

/**
 * Single product image slot. A real photo uses the product name as alt text.
 * Without a photo, the wash stays decorative.
 */
export function ProductVisual({
  name,
  imageUrl,
  className,
  fill = false,
  priority = false,
  eager = false,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
  /** Cover a relative parent. Use when the slot should not set its own height. */
  fill?: boolean;
  /** The one largest photo. Preloads. */
  priority?: boolean;
  /** Other photos already on the first screen. Loads immediately. */
  eager?: boolean;
}) {
  const frame = `${fill ? "absolute inset-0" : "relative"} block overflow-hidden ${className ?? ""}`;

  if (imageUrl) {
    return (
      <span className={frame}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          unoptimized
          priority={priority}
          loading={priority || eager ? "eager" : "lazy"}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 640px"
        />
      </span>
    );
  }

  const tone = washIndex(name);
  const mark = shopInitials(name);

  return (
    <span
      aria-hidden
      className={`${fill ? "absolute inset-0" : "relative"} @container block overflow-hidden ${className ?? ""}`}
    >
      <span className={`absolute inset-0 ${WASHES[tone]}`} />
      <span className={`absolute inset-0 ${STRIPES[tone]}`} />
      <span className="absolute top-3 left-3 size-2.5 rounded-sm bg-accent" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="text-[30cqw] leading-none font-extrabold tracking-tight text-charcoal/25 select-none dark:text-white/35">
          {mark.length === 2 ? `${mark[0]}\u2006${mark[1]}` : mark}
        </span>
      </span>
    </span>
  );
}
