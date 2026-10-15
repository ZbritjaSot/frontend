import { describe, expect, it } from "vitest";
import { shopInitials } from "@/features/public/initials";

describe("shopInitials", () => {
  it("takes one or two leading letters from the shop name", () => {
    expect(shopInitials("Viva Fresh")).toBe("VF");
    expect(shopInitials("Emona")).toBe("E");
  });

  it("uppercases Albanian letters without relying on locale data", () => {
    expect(shopInitials("ëmbël")).toBe("Ë");
    expect(shopInitials("çaj House")).toBe("ÇH");
  });

  it("falls back when the name has no letters", () => {
    expect(shopInitials("   ")).toBe("Z");
  });
});
