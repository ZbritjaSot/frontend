import { describe, expect, it } from "vitest";
import { addLocalMonths, defaultSubscriptionWindow } from "@/lib/datetime";

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
