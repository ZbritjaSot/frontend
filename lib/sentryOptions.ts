import type { BrowserOptions } from "@sentry/nextjs";

/**
 * Shared Sentry init options (client, server, edge). Sentry stays fully off unless
 * NEXT_PUBLIC_SENTRY_DSN is set. Tracing, session replay and logs are intentionally not
 * enabled, and no user info, cookies, headers, bodies or query params are sent.
 */
export function sentryOptions(): Pick<
  BrowserOptions,
  "dsn" | "enabled" | "environment" | "dataCollection"
> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined;

  return {
    dsn,
    enabled: Boolean(dsn),
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT?.trim() ||
      (process.env.NODE_ENV === "production" ? "production" : "development"),
    // Sentry v11 collects cookies, headers and query params by default; send none of it.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
  };
}
