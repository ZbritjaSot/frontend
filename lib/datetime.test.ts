import { describe, expect, it } from "vitest";
import {
  addLocalMonths,
  defaultOfferWindow,
  defaultSubscriptionWindow,
  earliestOfferStart,
  OFFER_START_LEAD_HOURS,
  toHourLocalValue,
} from "@/lib/datetime";

describe("addLocalMonths", () => {
  it("keeps the day when the next month has it", () => {
    expect(addLocalMonths("2026-03-15T00:00", 1)).toBe("2026-04-15T00:00");
    expect(addLocalMonths("2026-03-15T00:00", 12)).toBe("2027-03-15T00:00");
  });

  it("stops on the last day of a shorter month", () => {
    expect(addLocalMonths("2026-01-31T00:00", 1)).toBe("2026-02-28T00:00");
    expect(addLocalMonths("2028-01-31T00:00", 1)).toBe("2028-02-29T00:00");
  });
});

describe("defaultSubscriptionWindow", () => {
  it("runs one month from local midnight", () => {
    const window = defaultSubscriptionWindow();
    expect(window.starts_at.endsWith("T00:00")).toBe(true);
    expect(window.ends_at).toBe(addLocalMonths(window.starts_at, 1));
  });
});

describe("offer hour precision", () => {
  it("snaps datetime-local values to the hour", () => {
    expect(toHourLocalValue("2026-09-01T14:37:00")).toBe("2026-09-01T14:00");
  });

  it("defaults offer windows on the hour", () => {
    const window = defaultOfferWindow();
    expect(window.starts_at.endsWith(":00")).toBe(true);
    expect(window.expires_at.endsWith(":00")).toBe(true);
  });

  it("earliest start is at least the lead hours ahead", () => {
    const from = new Date("2026-10-12T09:00:00");
    const earliest = earliestOfferStart(from);
    expect(earliest.getTime()).toBe(
      from.getTime() + OFFER_START_LEAD_HOURS * 60 * 60 * 1000,
    );
  });
});
