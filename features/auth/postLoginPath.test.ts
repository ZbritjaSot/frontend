import { describe, expect, it } from "vitest";
import { hasDashboardRole, postLoginPath } from "@/features/auth/postLoginPath";
import type { User } from "@/types";

function userWithRoles(roles: string[]): User {
  return {
    id: "1",
    name: "Test",
    email: "test@example.com",
    roles,
  };
}

describe("hasDashboardRole", () => {
  it("accepts admin, business, and manager", () => {
    expect(hasDashboardRole(userWithRoles(["admin"]))).toBe(true);
    expect(hasDashboardRole(userWithRoles(["business"]))).toBe(true);
    expect(hasDashboardRole(userWithRoles(["manager"]))).toBe(true);
    expect(hasDashboardRole(userWithRoles(["viewer"]))).toBe(false);
  });
});

describe("postLoginPath", () => {
  it("sends each role to its dashboard", () => {
    expect(postLoginPath(userWithRoles(["admin"]))).toBe("/admin");
    expect(postLoginPath(userWithRoles(["business"]))).toBe("/biz");
    expect(postLoginPath(userWithRoles(["manager"]))).toBe("/biz");
  });

  it("honors next only inside the user's area", () => {
    expect(postLoginPath(userWithRoles(["admin"]), "/admin/offers")).toBe(
      "/admin/offers",
    );
    expect(postLoginPath(userWithRoles(["admin"]), "/biz/offers")).toBe("/admin");
    expect(postLoginPath(userWithRoles(["business"]), "/biz/flyers")).toBe(
      "/biz/flyers",
    );
    expect(postLoginPath(userWithRoles(["business"]), "/admin/offers")).toBe(
      "/biz",
    );
    expect(postLoginPath(userWithRoles(["manager"]), "/biz/review/new")).toBe(
      "/biz/review/new",
    );
  });

  it("rejects open redirects", () => {
    expect(postLoginPath(userWithRoles(["admin"]), "https://evil.test")).toBe(
      "/admin",
    );
  });
});
