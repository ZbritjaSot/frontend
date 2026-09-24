import { describe, expect, it } from "vitest";
import {
  centsToEurosInput,
  eurosToCents,
  formatCalendarDateSq,
  formatDateShortSq,
  formatDateSq,
  formatDateTimeShortSq,
  formatDiscountPercent,
  formatEur,
  formatEurFromCents,
  formatMonthYearSq,
} from "@/lib/format";

describe("euro formatters", () => {
  it("groups thousands and uses a comma for cents", () => {
    expect(formatEur(1.4)).toBe("1,40 €");
    expect(formatEur(1234.5)).toBe("1.234,50 €");
    expect(formatEur(-1.4)).toBe("-1,40 €");
  });

  it("returns a dash for a value that is not a number", () => {
    expect(formatEur("nuk")).toBe("—");
    expect(formatEurFromCents(Number.NaN)).toBe("—");
  });

  it("converts integer cents to and from euros", () => {
    expect(formatEurFromCents(5000)).toBe("50,00 €");
    expect(eurosToCents("50.00")).toBe(5000);
    expect(centsToEurosInput(5000)).toBe("50.00");
  });

  it("labels a discount percent", () => {
    expect(formatDiscountPercent(30)).toBe("-30%");
    expect(formatDiscountPercent(Number.NaN)).toBe("");
  });
});

describe("Albanian dates", () => {
  const atNoonUtc = "2026-09-22T12:05:00Z";

  it("writes the long and short Kosovo date", () => {
    expect(formatDateSq(atNoonUtc)).toBe("22 shtator 2026");
    expect(formatDateShortSq(atNoonUtc)).toBe("22.09.2026");
    expect(formatDateTimeShortSq(atNoonUtc)).toBe("22.09.2026 14:05");
  });

  it("returns a dash for a date that cannot be read", () => {
    expect(formatDateSq("jo-datë")).toBe("—");
    expect(formatDateShortSq("jo-datë")).toBe("—");
    expect(formatDateTimeShortSq("jo-datë")).toBe("—");
  });

  it("formats a calendar day and month heading", () => {
    expect(formatCalendarDateSq(2026, 9, 22)).toBe("22 shtator 2026");
    expect(formatMonthYearSq(2026, 9)).toBe("Shtator 2026");
    expect(formatMonthYearSq(2026, 13)).toBe("—");
  });
});
