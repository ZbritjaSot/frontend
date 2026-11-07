import { describe, expect, it } from "vitest";
import { computeDiscountPercent, inferPricingMode } from "@/lib/discount";

describe("computeDiscountPercent", () => {
  it("computes an exact percent", () => {
    expect(computeDiscountPercent(10000, 7000)).toBe(30);
  });

  it("rounds a fractional percent to the nearest whole percent", () => {
    expect(computeDiscountPercent(999, 699)).toBe(30);
  });

  it("can land far from what a round starting percent might suggest", () => {
    // 3 cents down to 2 cents is a real 33% discount, even though a shop
    // picturing "50% off 3 cents" would have landed on the same 2 cents.
    expect(computeDiscountPercent(3, 2)).toBe(33);
  });

  it("can round up to 100, matching the backend's reject-rather-than-cap rule", () => {
    expect(computeDiscountPercent(200, 1)).toBe(100);
  });
});

describe("inferPricingMode", () => {
  it("is price mode when either price is set", () => {
    expect(inferPricingMode({ original_price: 2000, discounted_price: 1400 })).toBe("price");
    expect(inferPricingMode({ original_price: 2000, discounted_price: null })).toBe("price");
  });

  it("is percent mode when both prices are null", () => {
    expect(inferPricingMode({ original_price: null, discounted_price: null })).toBe("percent");
  });
});
