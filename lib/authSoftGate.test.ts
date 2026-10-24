import { describe, expect, it } from "vitest";
import {
  isBizAuthPublicPath,
  isSoftGateEnabled,
  softGateDecision,
} from "@/lib/authSoftGate";

describe("isSoftGateEnabled", () => {
  it("accepts common truthy strings", () => {
    expect(isSoftGateEnabled("1")).toBe(true);
    expect(isSoftGateEnabled("true")).toBe(true);
    expect(isSoftGateEnabled("YES")).toBe(true);
    expect(isSoftGateEnabled("0")).toBe(false);
    expect(isSoftGateEnabled(undefined)).toBe(false);
  });
});

describe("isBizAuthPublicPath", () => {
  it("allows login and password-recovery routes", () => {
    expect(isBizAuthPublicPath("/biz/login")).toBe(true);
    expect(isBizAuthPublicPath("/biz/forgot-password")).toBe(true);
    expect(isBizAuthPublicPath("/biz/reset-password")).toBe(true);
    expect(isBizAuthPublicPath("/biz/reset-password/extra")).toBe(true);
    expect(isBizAuthPublicPath("/biz/offers")).toBe(false);
  });
});

describe("softGateDecision", () => {
  it("passes through when a session cookie is present", () => {
    expect(softGateDecision("/admin/offers", true)).toEqual({ action: "next" });
    expect(softGateDecision("/biz/flyers", true)).toEqual({ action: "next" });
  });

  it("redirects unauthenticated dashboard paths to the unified login", () => {
    expect(softGateDecision("/admin/offers", false)).toEqual({
      action: "redirect",
      loginPath: "/login",
      next: "/admin/offers",
    });
    expect(softGateDecision("/biz/profile", false)).toEqual({
      action: "redirect",
      loginPath: "/login",
      next: "/biz/profile",
    });
  });

  it("does not redirect auth public paths", () => {
    expect(softGateDecision("/admin/login", false)).toEqual({ action: "next" });
    expect(softGateDecision("/biz/login", false)).toEqual({ action: "next" });
    expect(softGateDecision("/biz/forgot-password", false)).toEqual({
      action: "next",
    });
    expect(softGateDecision("/biz/reset-password", false)).toEqual({
      action: "next",
    });
    expect(softGateDecision("/login", false)).toEqual({ action: "next" });
  });
});
