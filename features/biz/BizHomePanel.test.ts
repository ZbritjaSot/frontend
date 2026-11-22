/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BizSubscription } from "@/types";

const business = vi.hoisted(() => vi.fn());
const subscription = vi.hoisted(() => vi.fn());
const byStatus = vi.hoisted(() => vi.fn());
const views = vi.hoisted(() => vi.fn());

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/features/biz/ViewsChart", () => ({
  ViewsChart: () => createElement("div", { "data-testid": "views-chart" }),
}));

vi.mock("@/hooks/useBizProfile", () => ({
  useBizBusiness: () => business(),
  useBizSubscription: () => subscription(),
}));

vi.mock("@/hooks/useBizOffers", () => ({
  useBizOffersByStatus: (status: string, perPage: number, catalog: string) =>
    byStatus(status, perPage, catalog),
  useBizOfferViews: (range: number) => views(range),
}));

const { BizHomePanel } = await import("@/features/biz/BizHomePanel");

afterEach(() => {
  cleanup();
  business.mockReset();
  subscription.mockReset();
  byStatus.mockReset();
  views.mockReset();
});

function settled<T>(data: T) {
  return {
    data,
    isLoading: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  };
}

function loading() {
  return {
    data: undefined,
    isLoading: true,
    isError: false,
    isFetching: true,
    error: null,
    refetch: vi.fn(),
  };
}

function sub(partial: Partial<BizSubscription>): BizSubscription {
  return {
    id: "sub-1",
    starts_at: "2026-11-01T00:00:00.000Z",
    ends_at: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    is_current: true,
    ...partial,
  };
}

function counts(table: Record<string, number>) {
  byStatus.mockImplementation((status: string, _perPage: number, catalog: string) =>
    settled({ data: [], meta: { total: table[`${catalog}:${status}`] ?? 0 } }),
  );
}

function readyViews(total = 80) {
  views.mockReturnValue(
    settled({
      total,
      top: [{ id: "top", name: "Kafe", view_count: 12 }],
      days: [{ date: "2026-11-22", views: 4 }],
    }),
  );
}

describe("BizHomePanel", () => {
  it("renders the page while each query is still pending", () => {
    business.mockReturnValue(loading());
    subscription.mockReturnValue(loading());
    byStatus.mockReturnValue(loading());
    views.mockReturnValue(loading());

    render(createElement(BizHomePanel));

    expect(screen.getByRole("heading", { name: "Paneli", level: 1 })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Fletushkë e re" })).toBeTruthy();
    expect(screen.queryByText("Duke ngarkuar panelin")).toBeNull();
    expect(screen.getByLabelText("Duke ngarkuar abonimin")).toBeTruthy();
    expect(screen.getByLabelText("Duke ngarkuar: Oferta aktive")).toBeTruthy();
    expect(screen.getByLabelText("Duke ngarkuar: Në pritje")).toBeTruthy();
    expect(screen.getByLabelText("Duke ngarkuar hapjet")).toBeTruthy();
    expect(screen.queryByText("Pa abonim")).toBeNull();
  });

  it("shows a loaded offer count while views are still pending", () => {
    business.mockReturnValue(settled({ name: "Market Drita" }));
    subscription.mockReturnValue(settled(sub({})));
    byStatus.mockImplementation((status: string, _perPage: number, catalog: string) => {
      if (catalog === "offers" && status === "approved") {
        return settled({ data: [], meta: { total: 5 } });
      }
      return loading();
    });
    views.mockReturnValue(loading());

    render(createElement(BizHomePanel));

    expect(screen.getByText("Market Drita")).toBeTruthy();
    expect(screen.getByText("Oferta aktive")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByLabelText("Duke ngarkuar: Fletushka aktive")).toBeTruthy();
    expect(screen.getByLabelText("Duke ngarkuar: Hapje gjithsej")).toBeTruthy();
    expect(screen.queryByTestId("views-chart")).toBeNull();
  });

  it("keeps four KPIs and moves subscription into a banner", () => {
    business.mockReturnValue(settled({ name: "Market Drita" }));
    subscription.mockReturnValue(settled(sub({})));
    counts({
      "offers:approved": 5,
      "flyers:approved": 4,
      "offers:pending": 1,
      "flyers:pending": 2,
    });
    readyViews(80);

    render(createElement(BizHomePanel));

    expect(screen.getByText("Oferta aktive")).toBeTruthy();
    expect(screen.getByText("Fletushka aktive")).toBeTruthy();
    expect(screen.getAllByText("Hapje gjithsej").length).toBeGreaterThan(0);
    expect(screen.getByText("Në pritje")).toBeTruthy();
    expect(screen.getByText("2 fletushka · 1 ofertë")).toBeTruthy();
    expect(screen.queryByText("14 ditët")).toBeNull();
    expect(screen.queryByText("Fletushka në pritje")).toBeNull();

    const banner = screen.getByRole("region", { name: "Abonimi" });
    expect(banner.textContent).toContain("Aktive");
    expect(screen.getByRole("link", { name: "Shiko abonimin" }).getAttribute("href")).toBe(
      "/biz/profile?tab=abonimi",
    );
    expect(screen.queryByRole("link", { name: "Rinovo" })).toBeNull();
    expect(screen.getByRole("link", { name: /Oferta aktive/ }).getAttribute("href")).toBe(
      "/biz/offers?status=approved",
    );
  });

  it("asks to renew when the subscription is expired or ending soon, without changing the status label", () => {
    business.mockReturnValue(settled({ name: "Market Drita" }));
    counts({});
    readyViews();
    subscription.mockReturnValue(
      settled(
        sub({
          is_current: false,
          ends_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        }),
      ),
    );

    const view = render(createElement(BizHomePanel));
    expect(screen.getByRole("region", { name: "Abonimi" }).textContent).toContain("Skaduar");
    expect(screen.getByText("Ofertat nuk shfaqen publike derisa të rinovohet.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Rinovo" }).getAttribute("href")).toBe(
      "/biz/profile?tab=abonimi",
    );

    subscription.mockReturnValue(
      settled(
        sub({
          ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ),
    );
    view.rerender(createElement(BizHomePanel));
    const banner = screen.getByRole("region", { name: "Abonimi" });
    expect(banner.textContent).toContain("Aktive");
    expect(banner.textContent).not.toContain("Skaduar");
    expect(screen.getByRole("link", { name: "Rinovo" })).toBeTruthy();
  });
});
