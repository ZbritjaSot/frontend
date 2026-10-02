import { formatDiscountPercent } from "@/lib/format";

/** Exclusive wordmark — identity, not a card badge. */
export function ExclusiveMark({
  size = "md",
  tone = "on-forest",
}: {
  size?: "sm" | "md" | "lg";
  tone?: "on-forest" | "on-light";
}) {
  const pad =
    size === "lg"
      ? "text-[0.72rem] tracking-[0.26em]"
      : size === "sm"
        ? "text-[0.62rem] tracking-[0.18em]"
        : "text-[0.65rem] tracking-[0.22em]";

  const color = tone === "on-forest" ? "text-accent" : "text-forest dark:text-accent";

  return (
    <span className={`inline-flex items-center gap-2.5 font-bold uppercase ${pad} ${color}`}>
      <span
        className={`h-px w-7 ${tone === "on-forest" ? "bg-accent" : "bg-forest dark:bg-accent"}`}
        aria-hidden
      />
      Ekskluzive
    </span>
  );
}

export function ExclusivePercent({
  percent,
  className = "",
  tone = "panel",
}: {
  percent: number;
  className?: string;
  /** panel = on ivory (readable forest); forest = on olive (lime). */
  tone?: "panel" | "forest";
}) {
  if (!Number.isFinite(percent) || percent <= 0) {
    return null;
  }

  const color =
    tone === "forest"
      ? "text-accent"
      : "text-forest dark:text-accent";

  return (
    <span
      className={`font-extrabold tracking-tight tabular-nums ${color} ${className}`.trim()}
    >
      {formatDiscountPercent(percent)}
    </span>
  );
}

/** @deprecated Prefer ExclusivePercent. */
export function ExclusiveDiscount({ percent }: { percent: number }) {
  return <ExclusivePercent percent={percent} />;
}

/**
 * Flat editorial surfaces only — no gradient, no drop shadow.
 * Shared media ratio keeps offers and flyers on one footprint.
 */
export const exclusiveMedia = "aspect-[4/5] w-full overflow-hidden bg-[#1a2420]";

export const exclusiveShell = {
  /** Collection / rail tile: photo stacked over ivory type panel. */
  tile: "flex h-full flex-col overflow-hidden rounded-2xl bg-ivory text-charcoal dark:bg-[#141a16] dark:text-ivory",
  /** Featured cover: media + brand panel. */
  featured:
    "overflow-hidden rounded-2xl bg-ivory text-charcoal dark:bg-[#141a16] dark:text-ivory",
} as const;

export const exclusiveFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
