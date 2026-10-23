const TITLE_MAX = 160;

/** Product title taken from the file name, without the extension. */
export function titleFromFilename(
  filename: string,
  maxLength = TITLE_MAX,
): string {
  const base = filename.split(/[/\\]/).pop() ?? "";
  const stem = base.includes(".") ? base.replace(/\.[^.]+$/, "") : base;
  const cleaned = stem.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.slice(0, maxLength).trimEnd();
}
