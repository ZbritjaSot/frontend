/** Shop mark initials — locale-independent so SSR matches the first client paint. */
export function shopInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part !== "");
  const letters = (parts.length > 1 ? parts.slice(0, 2) : parts.slice(0, 1))
    .map((part) => part[0] ?? "")
    .join("");

  return letters.toUpperCase() || "Z";
}
