import { describe, expect, it } from "vitest";
import { discountSegments } from "@/features/public/price";

const GREEN = { from: "#2C862B", to: "#08752D" };
const YELLOW = { from: "#FFE066", to: "#F5B800" };
const ORANGE = { from: "#FFC02E", to: "#E96800" };
const RED = { from: "#E0263B", to: "#C21A31" };

function hasNoAdjacentDuplicates(segments: { from: string; to: string }[]): boolean {
  return segments.every(
    (segment, index) => index === 0 || segment.from !== segments[index - 1].from,
  );
}

describe("discountSegments", () => {
  it("returns 6 segments of the same color for a single item (one band)", () => {
    const result = discountSegments([{ discount_percent: 20 }]);
    expect(result).toHaveLength(6);
    expect(result.every((segment) => segment.from === GREEN.from)).toBe(true);
  });

  it("splits unevenly between two bands with no adjacent duplicates and both colors present", () => {
    const result = discountSegments([
      { discount_percent: 20 },
      { discount_percent: 21 },
      { discount_percent: 22 },
      { discount_percent: 23 },
      { discount_percent: 24 },
      { discount_percent: 40 },
    ]);

    expect(result).toHaveLength(6);
    expect(hasNoAdjacentDuplicates(result)).toBe(true);
    expect(result.some((segment) => segment.from === GREEN.from)).toBe(true);
    expect(result.some((segment) => segment.from === YELLOW.from)).toBe(true);
    expect(result).toEqual([GREEN, YELLOW, GREEN, YELLOW, GREEN, YELLOW]);
  });

  it("includes every band when four bands each have one item, with no adjacent duplicates, length 6-8", () => {
    const result = discountSegments([
      { discount_percent: 20 },
      { discount_percent: 40 },
      { discount_percent: 60 },
      { discount_percent: 90 },
    ]);

    expect(result.length).toBeGreaterThanOrEqual(6);
    expect(result.length).toBeLessThanOrEqual(8);
    expect(hasNoAdjacentDuplicates(result)).toBe(true);
    for (const band of [GREEN, YELLOW, ORANGE, RED]) {
      expect(result.some((segment) => segment.from === band.from)).toBe(true);
    }
  });

  it("clamps to 8 segments, all the same color, when many items fall in a single band", () => {
    const result = discountSegments(
      Array.from({ length: 20 }, () => ({ discount_percent: 20 })),
    );

    expect(result).toHaveLength(8);
    expect(result.every((segment) => segment.from === GREEN.from)).toBe(true);
  });

  it("returns 8 segments with no adjacent duplicates when many items spread across all four bands", () => {
    const items = Array.from({ length: 3 }, () => [
      { discount_percent: 20 },
      { discount_percent: 40 },
      { discount_percent: 60 },
      { discount_percent: 90 },
    ]).flat();

    const result = discountSegments(items);

    expect(result).toHaveLength(8);
    expect(hasNoAdjacentDuplicates(result)).toBe(true);
    for (const band of [GREEN, YELLOW, ORANGE, RED]) {
      expect(result.some((segment) => segment.from === band.from)).toBe(true);
    }
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
