import { afterEach, describe, expect, it, vi } from "vitest";

describe("SITE_URL", () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("defaults to production origin", async () => {
    const { SITE_URL } = await import("@/lib/site");
    expect(SITE_URL).toBe("https://www.zbritjasot.com");
  });

  it("uses NEXT_PUBLIC_SITE_URL without trailing slash", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://staging.example.com/";
    vi.resetModules();
    const { SITE_URL } = await import("@/lib/site");
    expect(SITE_URL).toBe("https://staging.example.com");
  });
});
