import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import {
  isUnauthenticated,
  requireAdminUser,
  requireBusinessUser,
} from "@/hooks/useAuth";
import type { User } from "@/types";

function user(roles: string[]): User {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Test",
    email: "test@example.com",
    roles,
  };
}

describe("auth helpers", () => {
  it("treats 401 and 419 as unauthenticated", () => {
    expect(isUnauthenticated(new ApiError("nope", 401))).toBe(true);
    expect(isUnauthenticated(new ApiError("csrf", 419))).toBe(true);
    expect(isUnauthenticated(new ApiError("oops", 500))).toBe(false);
    expect(isUnauthenticated(new Error("x"))).toBe(false);
  });

  it("accepts business and manager for the biz gate", () => {
    expect(requireBusinessUser(user(["business"]))).toBe(true);
    expect(requireBusinessUser(user(["manager"]))).toBe(true);
    expect(requireBusinessUser(user(["admin"]))).toBe(false);
    expect(requireBusinessUser(undefined)).toBe(false);
  });

  it("accepts only admin for the admin gate", () => {
    expect(requireAdminUser(user(["admin"]))).toBe(true);
    expect(requireAdminUser(user(["business"]))).toBe(false);
  });
});
