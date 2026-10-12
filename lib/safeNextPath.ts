/**
 * Allow only same-origin relative paths under known prefixes (open-redirect safe).
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback: string,
  allowedPrefixes: string[],
): string {
  if (!raw) {
    return fallback;
  }

  const path = raw.trim();
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("://") ||
    path.includes("\\") ||
    path.includes("\n") ||
    path.includes("\r")
  ) {
    return fallback;
  }

  const pathname = path.split(/[?#]/, 1)[0] ?? path;
  const allowed = allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return allowed ? path : fallback;
}
