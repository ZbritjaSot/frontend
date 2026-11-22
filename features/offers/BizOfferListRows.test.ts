/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";

const offers = vi.hoisted(() => vi.fn());

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));
vi.mock("@/hooks/useAuth", () => ({ useMe: () => ({ data: null }) }));
vi.mock("@/hooks/useBizOffers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useBizOffers")>();
  return { ...actual, useBizOffers: (...args: unknown[]) => offers(...args) };
});

const { BizOfferList } = await import("@/features/offers/BizOfferList");

afterEach(() => {
  cleanup();
  offers.mockReset();
});

describe("BizOfferList rows below md", () => {
  it("labels meta cells and keeps the labelled actions single", () => {
    offers.mockReturnValue({
      data: {
        data: [
          {
            id: "b1",
            title: "Fletushka verore",
            starts_at: "2026-11-22T10:00:00Z",
            expires_at: "2026-11-30T10:00:00Z",
            status: "draft",
            rejection_reason: null,
            items_count: 3,
          },
        ],
        meta: { last_page: 1, total: 1 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    const client = new QueryClient();
    render(
      createElement(QueryClientProvider, { client }, createElement(ToastProvider, null, createElement(BizOfferList))),
    );

    const row = screen.getAllByRole("listitem").find((li) => li.querySelector("a"));
    expect(row!.className).toContain("md:grid-cols-subgrid md:gap-x-4");
    expect(row!.className).toContain("max-md:flex");
    expect(screen.getByText("Produkte:").className).toContain("md:hidden");
    expect(screen.getByText("Skadon:").className).toContain("md:hidden");
    expect(screen.getAllByRole("button", { name: "Dërgo Fletushka verore" })).toHaveLength(1);
  });
});
