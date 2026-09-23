type SpinnerProps = {
  /** Accessible label (visually hidden). */
  label?: string;
  size?: "sm" | "md" | "lg";
  /** Center in available space with padding. */
  block?: boolean;
  /** `onAccent` = charcoal ring for lime buttons. */
  tone?: "accent" | "onAccent";
};

const sizeClass = {
  sm: "size-5 border-2",
  md: "size-8 border-[2.5px]",
  lg: "size-11 border-[3px]",
} as const;

export function Spinner({
  label = "Duke ngarkuar",
  size = "md",
  block = true,
  tone = "accent",
}: SpinnerProps) {
  const ring =
    tone === "onAccent"
      ? "border-charcoal/28 border-t-charcoal"
      : "border-accent/25 border-t-accent";

  return (
    <div
      className={
        block
          ? "flex w-full items-center justify-center py-14"
          : "inline-flex items-center justify-center"
      }
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className={`inline-block animate-spin rounded-full border-solid ${sizeClass[size]} ${ring}`}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
