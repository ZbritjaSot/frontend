/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { FilterChips } from "@/features/public/FilterChips";

afterEach(() => {
  cleanup();
});

describe("FilterChips", () => {
  it("renders nothing when no filter is active", () => {
    const { container } = render(
      createElement(FilterChips, { basePath: "/oferta" }),
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a removable chip per active filter, each dropping only its own filter", () => {
    render(
      createElement(FilterChips, {
        basePath: "/oferta",
        katalog: "oferta",
        q: "byrek",
        category: "ushqim",
        city: "Prishtinë",
        sort: "newest",
        categories: [{ id: "1", name: "Ushqim", slug: "ushqim" }],
      }),
    );

    const queryChip = screen.getByRole("link", { name: "Hiq filtrin: “byrek”" });
    expect(queryChip.getAttribute("href")).toBe("/oferta?category=ushqim&city=Prishtin%C3%AB");

    const categoryChip = screen.getByRole("link", { name: "Hiq filtrin: Ushqim" });
    expect(categoryChip.getAttribute("href")).toBe("/oferta?q=byrek&city=Prishtin%C3%AB");

    const cityChip = screen.getByRole("link", { name: "Hiq filtrin: Prishtinë" });
    expect(cityChip.getAttribute("href")).toBe("/oferta?q=byrek&category=ushqim");
  });

  it("'Pastro të gjitha' clears every filter at once", () => {
    render(
      createElement(FilterChips, {
        basePath: "/oferta",
        katalog: "oferta",
        q: "byrek",
        category: "ushqim",
        city: "Prishtinë",
      }),
    );

    const clearAll = screen.getByRole("link", { name: "Pastro të gjitha" });
    expect(clearAll.getAttribute("href")).toBe("/oferta");
  });
});
