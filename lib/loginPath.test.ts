import { describe, expect, it } from "vitest";
import { LOGIN_PATH, loginHref } from "@/lib/loginPath";

describe("loginHref", () => {
  it("returns the unified login path", () => {
    expect(loginHref()).toBe(LOGIN_PATH);
    expect(loginHref(null)).toBe("/login");
  });

  it("attaches a safe next query", () => {
    expect(loginHref("/admin/offers")).toBe("/login?next=%2Fadmin%2Foffers");
    expect(loginHref("/biz/flyers")).toBe("/login?next=%2Fbiz%2Fflyers");
  });
});
