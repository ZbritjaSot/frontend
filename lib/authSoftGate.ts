/**
 * Pure rules for the optional Next soft dashboard gate.
 * Cookie presence is not authorization — Require*Auth + the API still decide.
 */

export function isSoftGateEnabled(
  raw: string | undefined | null = process.env.AUTH_SOFT_GATE,
): boolean {
  const value = raw?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function isBizAuthPublicPath(pathname: string): boolean {
  return (
    pathname === "/biz/login" ||
    pathname === "/biz/forgot-password" ||
    pathname === "/biz/reset-password" ||
    pathname.startsWith("/biz/reset-password/")
  );
}

export type SoftGateDecision =
  | { action: "next" }
  | { action: "redirect"; loginPath: "/admin/login" | "/biz/login"; next: string };

/**
 * Decide whether an unauthenticated request should bounce to login.
 * Call only when the soft gate is enabled.
 */
export function softGateDecision(
  pathname: string,
  hasSessionCookie: boolean,
): SoftGateDecision {
  if (hasSessionCookie) {
    return { action: "next" };
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return { action: "redirect", loginPath: "/admin/login", next: pathname };
  }

  if (pathname.startsWith("/biz") && !isBizAuthPublicPath(pathname)) {
    return { action: "redirect", loginPath: "/biz/login", next: pathname };
  }

  return { action: "next" };
}
