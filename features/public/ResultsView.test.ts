/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResultsView } from "@/features/public/ResultsView";

// `CatalogFilters` calls `useRouter()` unconditionally (used by its city
// dropdown), which throws outside a mounted Next.js app router.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
});

describe("ResultsView empty state", () => {
  it("offers 'Pastro filtrat' and 'Shiko të gjitha ofertat' when a filtered search has no results", () => {
    render(
      createElement(ResultsView, {
        folders: [],
        offers: [],
        categories: [{ id: "1", name: "Ushqim", slug: "ushqim" }],
        q: "",
        category: "ushqim",
        katalog: "oferta",
        page: 1,
        offerLastPage: 1,
        folderLastPage: 1,
      }),
    );

    expect(screen.getByText("Nuk u gjet asgjë")).toBeTruthy();

    const clearFilters = screen.getByRole("link", { name: "Pastro filtrat" });
    expect(clearFilters.getAttribute("href")).toBe("/oferta");

    const seeAll = screen.getByRole("link", { name: "Shiko të gjitha ofertat" });
    expect(seeAll.getAttribute("href")).toBe("/oferta");
  });

  it("omits 'Pastro filtrat' (nothing to clear) when the whole catalogue is simply empty", () => {
    render(
      createElement(ResultsView, {
        folders: [],
        offers: [],
        categories: [],
        q: "",
        katalog: "oferta",
        page: 1,
        offerLastPage: 1,
        folderLastPage: 1,
      }),
    );

    expect(screen.getByText("Nuk u gjet asgjë")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Pastro filtrat" })).toBeNull();
    expect(screen.getByRole("link", { name: "Shiko të gjitha ofertat" })).toBeTruthy();
  });
});
