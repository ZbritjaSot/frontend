/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

vi.mock("@/hooks/useAuth", () => ({
  useMe: () => ({ data: null }),
}));

vi.mock("@/hooks/useBizOffers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useBizOffers")>();
  return {
    ...actual,
    useBizOffers: (...args: unknown[]) => offers(...args),
  };
});

const { BizOfferList } = await import("@/features/offers/BizOfferList");

afterEach(() => {
  cleanup();
  offers.mockReset();
});

function result(lastPage: number, isLoading = false) {
  return {
    data: {
      data: Array.from({ length: lastPage }, (_, index) => ({
        id: `bundle-${index + 1}`,
        title: `Fletushka ${index + 1}`,
        starts_at: "2026-11-22T10:00:00Z",
        expires_at: "2026-11-30T10:00:00Z",
        status: "draft",
        rejection_reason: null,
        items_count: 1,
      })),
      meta: { last_page: lastPage, total: lastPage },
    },
    isLoading,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
}

function renderList() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    createElement(
      QueryClientProvider,
      { client },
      createElement(ToastProvider, null, createElement(BizOfferList)),
    ),
  );
}

describe("BizOfferList page clamp", () => {
  it("keeps the page while loading, then clamps once the shorter list arrives", async () => {
    offers.mockReturnValue(result(3));
    const view = renderList();
    fireEvent.click(screen.getByRole("button", { name: "Faqja tjetër" }));
    fireEvent.click(screen.getByRole("button", { name: "Faqja tjetër" }));
    expect(screen.getByText("Faqja 3 nga 3")).toBeTruthy();

    offers.mockReturnValue(result(1, true));
    view.rerender(
      createElement(
        QueryClientProvider,
        {
          client: new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
          }),
        },
        createElement(ToastProvider, null, createElement(BizOfferList)),
      ),
    );
    expect(screen.getByText("Duke ngarkuar fletushkat")).toBeTruthy();

    offers.mockReturnValue(result(3));
    view.rerender(
      createElement(
        QueryClientProvider,
        {
          client: new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
          }),
        },
        createElement(ToastProvider, null, createElement(BizOfferList)),
      ),
    );
    await waitFor(() => expect(screen.getByText("Faqja 3 nga 3")).toBeTruthy());

    offers.mockReturnValue(result(1));
    view.rerender(
      createElement(
        QueryClientProvider,
        {
          client: new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
          }),
        },
        createElement(ToastProvider, null, createElement(BizOfferList)),
      ),
    );
    await waitFor(() => expect(screen.getByText("Faqja 1 nga 1")).toBeTruthy());
  });
});
