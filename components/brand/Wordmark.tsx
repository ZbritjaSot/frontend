type WordmarkProps = {
  as?: "h1" | "p" | "span";
  className?: string;
  /** Header chrome uses light text; pages use the theme ink color. */
  tone?: "ink" | "chrome";
};

export function Wordmark({
  as: Tag = "span",
  className,
  tone = "ink",
}: WordmarkProps) {
  return (
    <Tag
      className={[
        "m-0 font-bold leading-none tracking-[-0.03em] whitespace-nowrap",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={tone === "chrome" ? "text-chrome-text" : "text-ink"}>
        Zbritja
      </span>
      <span className="text-accent">Sot</span>
    </Tag>
  );
}
