/** Two-mode discount pricing: price mode (both prices, percent computed) or percent mode (percent only). */

export const MIN_DISCOUNT_PERCENT = 1;
export const MAX_DISCOUNT_PERCENT = 99;

export type PricingMode = "price" | "percent";

/**
 * Mirrors the backend's `DiscountCalculator::resolve()` rounding exactly
 * (same direction, `Math.round` ~ PHP's default `round()` for positive
 * numbers) so the live preview never disagrees with what the server stores.
 */
export function computeDiscountPercent(
  originalCents: number,
  discountedCents: number,
): number {
  if (!Number.isFinite(originalCents) || originalCents <= 0) {
    return NaN;
  }
  return Math.round(((originalCents - discountedCents) / originalCents) * 100);
}

/** Restores the right mode for an existing item: price mode when it has prices, percent mode otherwise. */
export function inferPricingMode(item: {
  original_price: number | null;
  discounted_price: number | null;
}): PricingMode {
  return item.original_price != null || item.discounted_price != null
    ? "price"
    : "percent";
}
