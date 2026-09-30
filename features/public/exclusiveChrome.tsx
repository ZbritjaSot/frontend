import { formatDiscountPercent } from "@/lib/format";

/** Small curated mark — hierarchy via size, not loud color. */
export function ExclusiveMark({
  size = "md",
  tone = "on-forest",
}: {
  size?: "sm" | "md" | "lg";
  /** on-forest sits on olive; on-light sits on cream. */
  tone?: "on-forest" | "on-light";
}) {
  const pad =
    size === "lg"
      ? "px-2.5 py-1 text-[0.62rem] tracking-[0.2em]"
      : size === "sm"
        ? "px-1.5 py-0.5 text-[0.58rem] tracking-[0.16em]"
        : "px-2 py-0.5 text-[0.6rem] tracking-[0.18em]";

  const colors =
    tone === "on-forest"
      ? "border-accent/55 bg-charcoal/35 text-accent"
      : "border-accent/45 bg-forest text-accent";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-extrabold uppercase ${pad} ${colors}`}
    >
      <span className="size-1 rounded-full bg-accent" aria-hidden />
      Ekskluzive
    </span>
  );
}

export function ExclusiveDiscount({ percent }: { percent: number }) {
  if (!Number.isFinite(percent) || percent <= 0) {
    return null;
  }

  return (
    <span className="inline-flex rounded-full border border-charcoal/10 bg-accent px-2 py-0.5 text-[0.7rem] leading-none font-extrabold tracking-tight text-charcoal tabular-nums shadow-[0_0_0_1px_rgba(168,255,0,0.25)]">
      {formatDiscountPercent(percent)}
    </span>
  );
}

/** Shared card shells — stronger → weaker. */
export const exclusiveShell = {
  featured:
    "relative overflow-hidden rounded-[1.75rem] bg-forest text-ivory ring-1 ring-accent/40 shadow-[0_0_0_1px_rgba(36,53,40,0.85),0_28px_64px_-40px_rgba(36,53,40,0.55)]",
  spotlight:
    "relative overflow-hidden rounded-[1.5rem] bg-forest text-ivory ring-1 ring-accent/30 shadow-[0_0_0_1px_rgba(36,53,40,0.7)]",
  flyer:
    "relative overflow-hidden rounded-[1.5rem] bg-forest text-ivory ring-1 ring-accent/28",
  offerFrame:
    "relative overflow-hidden rounded-2xl bg-elevated ring-1 ring-accent/28 shadow-[0_0_0_1px_rgba(36,53,40,0.08)]",
} as const;

export const exclusiveFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
