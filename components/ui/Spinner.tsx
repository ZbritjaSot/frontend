type SpinnerProps = {
  /** Accessible label (visually hidden). */
  label?: string;
  size?: "sm" | "md" | "lg";
  /** Center in available space with padding. */
  block?: boolean;
  /** `onAccent` = charcoal ring for lime buttons. */
  tone?: "accent" | "onAccent";
};

export function Spinner({
  label = "Duke ngarkuar",
  size = "md",
  block = true,
  tone = "accent",
}: SpinnerProps) {
  return (
    <div
      className={[
        "spinner-wrap",
        block ? "spinner-wrap--block" : null,
        tone === "onAccent" ? "spinner-wrap--on-accent" : null,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className={`spinner spinner--${size}`} aria-hidden />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
