import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { passwordError, validateNewPassword } from "@/lib/passwordErrors";

describe("passwordError", () => {
  it("translates known API messages", () => {
    expect(
      passwordError(
        new ApiError("The current password is incorrect.", 422, {
          message: "The current password is incorrect.",
        }),
      ),
    ).toBe("Fjalëkalimi aktual nuk është i saktë.");
    expect(
      passwordError(
        new ApiError("The new password must be different.", 422, {
          message: "The new password must be different.",
        }),
      ),
    ).toBe("Fjalëkalimi i ri duhet të jetë i ndryshëm.");
  });

  it("falls back to Error.message", () => {
    expect(passwordError(new ApiError("Something else", 500))).toBe(
      "Something else",
    );
  });
});

describe("validateNewPassword", () => {
  it("checks length and confirmation", () => {
    expect(validateNewPassword("short", "short")).toMatch(/8 karaktere/);
    expect(validateNewPassword("longenough", "other")).toMatch(/përputhen/);
    expect(validateNewPassword("longenough", "longenough")).toBeNull();
  });
});
