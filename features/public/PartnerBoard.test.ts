/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PartnerBoard } from "@/features/public/PartnerBoard";
import type { PublicBusiness } from "@/types";

vi.mock("@/features/offers/api", () => ({
  fetchPublicBusinesses: vi.fn(),
  PUBLIC_BUSINESSES_PAGE_SIZE: 20,
}));

vi.mock("@/components/favorites/FavoriteButton", () => ({
  FavoriteButton: () => null,
}));

vi.mock("@/features/public/visuals", () => ({
  ProductVisual: () => null,
  ShopLogo: () => createElement("span"),
}));

vi.mock("@/features/public/StepRail", () => ({
  StepRail: () => null,
}));

afterEach(() => {
  cleanup();
});

const shop: PublicBusiness = {
  id: "shop-1",
  name: "Market",
  city: "Prishtinë",
  offers: [
    {
      id: "offer-1",
      name: "Qumësht",
      original_price: 100,
      discounted_price: 80,
      discount_percent: 20,
      starts_at: "2026-01-01T00:00:00Z",
      expires_at: "2026-12-31T00:00:00Z",
    },
  ],
};

describe("RailButton", () => {
  it("is 40px and uses the hover token", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    render(
      createElement(
        QueryClientProvider,
        { client },
        createElement(PartnerBoard, { shops: [shop], lastPage: 1 }),
      ),
    );

    const next = screen.getByRole("button", { name: "Tjetra" });
    expect(next.className).toContain("size-10");
    expect(next.className).toContain("hover:bg-hover");
    expect(next.className).not.toContain("size-8");
  });
});
