import { describe, expect, it } from "vitest";
import { discountSegments } from "@/features/public/price";

describe("discountSegments", () => {
  it("returns one segment for a single discount percent", () => {
    expect(discountSegments([{ discount_percent: 20 }])).toEqual([
      { from: "#2C862B", to: "#08752D" },
    ]);
  });

  it("returns two segments for two distinct bands", () => {
    expect(
      discountSegments([{ discount_percent: 20 }, { discount_percent: 40 }]),
    ).toEqual([
      { from: "#2C862B", to: "#08752D" },
      { from: "#FFE066", to: "#F5B800" },
    ]);
  });

  it("returns three segments for three distinct bands", () => {
    expect(
      discountSegments([
        { discount_percent: 20 },
        { discount_percent: 40 },
        { discount_percent: 60 },
      ]),
    ).toEqual([
      { from: "#2C862B", to: "#08752D" },
      { from: "#FFE066", to: "#F5B800" },
      { from: "#FFC02E", to: "#E96800" },
    ]);
  });

  it("returns four segments for four distinct bands", () => {
    expect(
      discountSegments([
        { discount_percent: 20 },
        { discount_percent: 40 },
        { discount_percent: 60 },
        { discount_percent: 90 },
      ]),
    ).toEqual([
      { from: "#2C862B", to: "#08752D" },
      { from: "#FFE066", to: "#F5B800" },
      { from: "#FFC02E", to: "#E96800" },
      { from: "#E0263B", to: "#C21A31" },
    ]);
  });

  it("does not repeat a band when more items than bands fall into the same band", () => {
    expect(
      discountSegments([
        { discount_percent: 10 },
        { discount_percent: 15 },
        { discount_percent: 22 },
        { discount_percent: 25 },
      ]),
    ).toEqual([{ from: "#2C862B", to: "#08752D" }]);
  });

  it("returns a single segment when every item falls in the same band", () => {
    expect(
      discountSegments([
        { discount_percent: 60 },
        { discount_percent: 65 },
        { discount_percent: 70 },
      ]),
    ).toEqual([{ from: "#FFC02E", to: "#E96800" }]);
  });

  it("returns an empty array for an empty items list", () => {
    expect(discountSegments([])).toEqual([]);
  });

  it("ignores null, undefined, zero, and negative percents mixed in with valid ones", () => {
    expect(
      discountSegments([
        { discount_percent: null },
        { discount_percent: undefined },
        { discount_percent: 0 },
        { discount_percent: -10 },
        { discount_percent: 30 },
      ]),
    ).toEqual([{ from: "#FFE066", to: "#F5B800" }]);
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
});
