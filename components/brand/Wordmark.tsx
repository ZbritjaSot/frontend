type WordmarkProps = {
  as?: "h1" | "p" | "span";
  className?: string;
};

export function Wordmark({ as: Tag = "span", className }: WordmarkProps) {
  return (
    <Tag className={["wordmark", className].filter(Boolean).join(" ")}>
      <span className="wordmark__name">Zbritja</span>
      <span className="wordmark__sot">Sot</span>
    </Tag>
  );
}
