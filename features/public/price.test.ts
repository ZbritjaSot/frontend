import { afterEach, describe, expect, it, vi } from "vitest";
import { discountSegments } from "@/features/public/price";

const GREEN = { from: "#2C862B", to: "#08752D" };
const YELLOW = { from: "#FFE066", to: "#F5B800" };
const ORANGE = { from: "#FFC02E", to: "#E96800" };
const RED = { from: "#E0263B", to: "#C21A31" };

describe("discountSegments", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 6 segments of the same color for a single item (one band)", () => {
    const result = discountSegments([{ discount_percent: 20 }]);
    expect(result).toHaveLength(6);
    expect(result.every((segment) => segment.from === GREEN.from)).toBe(true);
  });

  it("only uses colors from the bands actually present among the items", () => {
    const result = discountSegments([
      { discount_percent: 20 },
      { discount_percent: 21 },
      { discount_percent: 22 },
      { discount_percent: 23 },
      { discount_percent: 24 },
      { discount_percent: 40 },
    ]);

    expect(result).toHaveLength(6);
    for (const segment of result) {
      expect([GREEN.from, YELLOW.from]).toContain(segment.from);
    }
  });

  it("stays within the four present bands when every band has one item, length 6-8", () => {
    const result = discountSegments([
      { discount_percent: 20 },
      { discount_percent: 40 },
      { discount_percent: 60 },
      { discount_percent: 90 },
    ]);

    expect(result.length).toBeGreaterThanOrEqual(6);
    expect(result.length).toBeLessThanOrEqual(8);
    for (const segment of result) {
      expect([GREEN.from, YELLOW.from, ORANGE.from, RED.from]).toContain(segment.from);
    }
  });

  it("clamps to 8 segments, all the same color, when many items fall in a single band", () => {
    const result = discountSegments(
      Array.from({ length: 20 }, () => ({ discount_percent: 20 })),
    );

    expect(result).toHaveLength(8);
    expect(result.every((segment) => segment.from === GREEN.from)).toBe(true);
  });

  it("returns 8 segments using only present-band colors when many items spread across all four bands", () => {
    const items = Array.from({ length: 3 }, () => [
      { discount_percent: 20 },
      { discount_percent: 40 },
      { discount_percent: 60 },
      { discount_percent: 90 },
    ]).flat();

    const result = discountSegments(items);

    expect(result).toHaveLength(8);
    for (const segment of result) {
      expect([GREEN.from, YELLOW.from, ORANGE.from, RED.from]).toContain(segment.from);
    }
  });

  // PO request: a color may now repeat on adjacent segments, i.e. picks are
  // no longer forced to cycle through every present band in turn. Pin
  // Math.random so every pick lands on the same band and confirm nothing
  // in the implementation still forces variety.
  it("allows the same color on every segment when random picks happen to repeat", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const result = discountSegments([{ discount_percent: 20 }, { discount_percent: 40 }]);

    expect(result).toHaveLength(6);
    expect(result.every((segment) => segment.from === GREEN.from)).toBe(true);
  });

  it("returns an empty array for an empty items list", () => {
    expect(discountSegments([])).toEqual([]);
  });

  it("returns an empty array when no item has a valid positive percent", () => {
    expect(
      discountSegments([
        { discount_percent: null },
        { discount_percent: undefined },
        { discount_percent: 0 },
        { discount_percent: -5 },
      ]),
    ).toEqual([]);
  });

  it("ignores null, undefined, zero, and negative percents mixed in with valid ones", () => {
    const result = discountSegments([
      { discount_percent: null },
      { discount_percent: undefined },
      { discount_percent: 0 },
      { discount_percent: -10 },
      { discount_percent: 30 },
    ]);

    expect(result).toHaveLength(6);
    expect(result.every((segment) => segment.from === YELLOW.from)).toBe(true);
  });
});
