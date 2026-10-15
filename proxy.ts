import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSoftGateEnabled, softGateDecision } from "@/lib/authSoftGate";
import { readKatalog } from "@/lib/browse";

/**
 * Soft dashboard gate (opt-in via AUTH_SOFT_GATE=1).
 *
 * Sanctum session cookies live on the API host. This gate only helps when the
 * browser also sends that cookie to the Next host — typical with localhost
 * (cookies ignore port) or production SESSION_DOMAIN=.yourdomain.com.
 * Role checks and real authorization still happen in Require*Auth + the API.
 *
 * Leave AUTH_SOFT_GATE unset/false when the Next and API hosts do not share
 * the session cookie, or logged-in users would bounce to login forever.
 * Do not enable in production by default without confirming that cookie sharing.
 */
const SESSION_COOKIE =
  process.env.SESSION_COOKIE_NAME?.trim() || "zbritjasot-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy `/?katalog=oferta|fletushka` → dedicated routes (preserve other query params).
  if (pathname === "/") {
    const katalog = readKatalog(request.nextUrl.searchParams.get("katalog") ?? undefined);
    if (katalog) {
      const url = request.nextUrl.clone();
      url.pathname = `/${katalog}`;
      url.searchParams.delete("katalog");
      return NextResponse.redirect(url, 308);
    }
  }

  if (!isSoftGateEnabled()) {
    return NextResponse.next();
  }

  const decision = softGateDecision(
    pathname,
    request.cookies.has(SESSION_COOKIE),
  );

  if (decision.action === "redirect") {
    const login = new URL(decision.loginPath, request.url);
    login.searchParams.set("next", decision.next);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/biz/:path*"],
};
