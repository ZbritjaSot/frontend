/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BusinessDirectoryPage from "@/app/(public)/biznese/page";
import { fetchPublicBusinesses, fetchPublicCities } from "@/features/offers/api";

vi.mock("@/features/offers/api", () => ({
  fetchPublicBusinesses: vi.fn(),
  fetchPublicCities: vi.fn(),
  PUBLIC_BUSINESSES_PAGE_SIZE: 20,
  ApiError: class ApiError extends Error {},
}));

vi.mock("@/features/public/DiscoverForm", () => ({
  DiscoverForm: () => createElement("form"),
}));

vi.mock("@/features/public/CatalogFilters", () => ({
  CatalogFilters: () => null,
}));

vi.mock("@/features/public/FilterChips", () => ({
  FilterChips: () => null,
}));

vi.mock("@/features/public/PartnerBoard", () => ({
  PartnerBoard: () => createElement("div", { "data-testid": "partner-board" }),
}));

afterEach(() => {
  cleanup();
});

function emptyDirectory() {
  vi.mocked(fetchPublicBusinesses).mockResolvedValue({
    data: [],
    meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
  });
  vi.mocked(fetchPublicCities).mockResolvedValue([]);
}

describe("partner directory", () => {
  it("drops the Partnerë kicker and clears city and search from the empty state", async () => {
    emptyDirectory();
    render(
      await BusinessDirectoryPage({
        searchParams: Promise.resolve({ q: "furra", city: "Pejë" }),
      }),
    );

    expect(screen.queryByText("Partnerë")).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Partnerët" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Shiko të gjithë partnerët" }).getAttribute("href")).toBe(
      "/biznese",
    );
  });

  it("omits the clear action when the directory itself is empty", async () => {
    emptyDirectory();
    render(await BusinessDirectoryPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Nuk u gjet asgjë")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Shiko të gjithë partnerët" })).toBeNull();
  });
});
