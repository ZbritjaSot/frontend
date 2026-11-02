import { ApiError, isNetworkError } from "@/lib/api";
import { describe, expect, it } from "vitest";

describe("isNetworkError", () => {
  it("keeps HTTP failures separate from a lost connection", () => {
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkError(new ApiError("API 500", 500))).toBe(false);
  });
});
