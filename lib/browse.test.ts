import { describe, expect, it } from "vitest";
import { showCatalogControls } from "@/lib/browse";

describe("showCatalogControls", () => {
  it("hides when the catalogue is empty and nothing is filtered", () => {
    expect(showCatalogControls({ hasResults: false })).toBe(false);
  });

  it("shows when there are results", () => {
    expect(showCatalogControls({ hasResults: true })).toBe(true);
  });

  it("shows when the visitor already filtered so they can clear", () => {
    expect(showCatalogControls({ hasResults: false, q: "qumesht" })).toBe(true);
    expect(showCatalogControls({ hasResults: false, category: "ushqim" })).toBe(
      true,
    );
    expect(showCatalogControls({ hasResults: false, city: "Prishtinë" })).toBe(
      true,
    );
    expect(showCatalogControls({ hasResults: false, sort: "oldest" })).toBe(
      true,
    );
  });
});
