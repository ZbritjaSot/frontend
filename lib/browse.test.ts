import { describe, expect, it } from "vitest";
import {
  browsePath,
  catalogPath,
  legacyKatalogRedirect,
  showCatalogControls,
} from "@/lib/browse";

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

describe("catalogPath", () => {
  it("maps katalog to dedicated routes", () => {
    expect(catalogPath("oferta")).toBe("/oferta");
    expect(catalogPath("fletushka")).toBe("/fletushka");
  });
});

describe("browsePath", () => {
  it("puts katalog in the path instead of the query string", () => {
    expect(browsePath("/", { katalog: "oferta" })).toBe("/oferta");
    expect(browsePath("/", { katalog: "fletushka", category: "ushqim" })).toBe(
      "/fletushka?category=ushqim",
    );
    expect(browsePath("/oferta", { q: "qumesht", city: "Prishtinë" })).toBe(
      "/oferta?q=qumesht&city=Prishtin%C3%AB",
    );
  });

  it("omits default sort and page 1", () => {
    expect(browsePath("/oferta", { sort: "newest", page: 1 })).toBe("/oferta");
    expect(browsePath("/oferta", { sort: "oldest", page: 2 })).toBe(
      "/oferta?sort=oldest&page=2",
    );
  });
});

describe("legacyKatalogRedirect", () => {
  it("preserves filters when moving off /?katalog=", () => {
    expect(
      legacyKatalogRedirect("oferta", {
        q: "qumesht",
        category: "ushqim",
        city: "Prishtinë",
        sort: "oldest",
        page: "2",
      }),
    ).toBe("/oferta?q=qumesht&category=ushqim&city=Prishtin%C3%AB&sort=oldest&page=2");
  });
});
