type SpinnerProps = {
  /** Accessible label (visually hidden). */
  label?: string;
  size?: "sm" | "md" | "lg";
  /** Center in available space with padding. */
  block?: boolean;
};

export function Spinner({
  label = "Duke ngarkuar",
  size = "md",
  block = true,
}: SpinnerProps) {
  return (
    <div
      className={["spinner-wrap", block ? "spinner-wrap--block" : null]
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
