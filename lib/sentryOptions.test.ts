import { afterEach, describe, expect, it, vi } from "vitest";
import { sentryOptions } from "@/lib/sentryOptions";

describe("sentryOptions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stays disabled without a DSN", () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");

    expect(sentryOptions()).toMatchObject({ dsn: undefined, enabled: false });
  });

  it("enables with a DSN and uses the explicit environment", () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://key@o0.ingest.sentry.io/0");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_ENVIRONMENT", "preview");

    expect(sentryOptions()).toMatchObject({ enabled: true, environment: "preview" });
  });

  it("collects no user info, cookies, headers, bodies or query params", () => {
    expect(sentryOptions().dataCollection).toEqual({
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    });
  });
});
