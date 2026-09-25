type WordmarkProps = {
  as?: "h1" | "p" | "span";
  className?: string;
  /** Header uses chrome text. Inverse is for a forest surface. */
  tone?: "ink" | "chrome" | "inverse";
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
      <span
        className={
          tone === "inverse" ? "text-ivory" : tone === "chrome" ? "text-chrome-text" : "text-ink"
        }
      >
        Zbritja
      </span>
      <span className={tone === "inverse" ? "text-accent" : "text-forest dark:text-accent"}>
        Sot
      </span>
    </Tag>
  );
}
