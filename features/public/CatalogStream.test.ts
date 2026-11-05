/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CatalogStream } from "@/features/public/CatalogStream";
import { fetchPublicFolders, fetchPublicOffers } from "@/features/offers/api";
import type { PublicOffer } from "@/types";

vi.mock("@/features/offers/api", () => ({
  fetchPublicOffers: vi.fn(),
  fetchPublicFolders: vi.fn(),
}));

// `ProductGrid`/`CampaignGrid` pull in `FavoriteButton` (router + toast +
// favorites context) — irrelevant to the pagination/state-persistence
// behavior under test, so they're stubbed out to just list the item ids.
vi.mock("@/features/public/ProductPoster", () => ({
  ProductGrid: ({ offers }: { offers: PublicOffer[] }) =>
    createElement(
      "div",
      { "data-testid": "product-grid" },
      offers.map((offer) => offer.id).join(","),
    ),
}));
vi.mock("@/features/public/CampaignPoster", () => ({
  CampaignGrid: () => createElement("div", { "data-testid": "campaign-grid" }),
  CampaignPoster: () => createElement("div", { "data-testid": "campaign-feature" }),
}));

type ObserverCallback = (entries: Pick<IntersectionObserverEntry, "isIntersecting">[]) => void;

/** Minimal `IntersectionObserver` stub so `useInfiniteSentinel` can register and be triggered manually. */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  private readonly callback: ObserverCallback;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  observe() {}
  disconnect() {}

  trigger(isIntersecting = true) {
    this.callback([{ isIntersecting }]);
  }
}

function offer(id: string): PublicOffer {
  return {
    id,
    name: `Oferta ${id}`,
    image: null,
    original_price: 1000,
    discounted_price: 800,
    discount_percent: 20,
    starts_at: "2026-01-01",
    expires_at: "2026-12-31",
  };
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  FakeIntersectionObserver.instances = [];
  vi.mocked(fetchPublicOffers).mockReset();
  vi.mocked(fetchPublicFolders).mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CatalogStream back-navigation state persistence", () => {
  it("keeps every previously loaded page after the component unmounts and remounts with the same query cache", async () => {
    // A single `QueryClient` instance, created once and reused across
    // render/unmount/render — this is what the root `QueryClientProvider`
    // (components/providers.tsx) gives every page in the real app, since it
    // isn't remounted on client-side navigation.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 30_000 } },
    });

    vi.mocked(fetchPublicOffers).mockResolvedValue({
      data: [offer("2")],
      meta: { current_page: 2, last_page: 2, per_page: 16, total: 2 },
    });

    const props = {
      katalog: "oferta" as const,
      offers: [offer("1")],
      folders: [],
      lastPage: 2,
      sort: "newest" as const,
    };

    const { unmount } = render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(CatalogStream, props),
      ),
    );

    expect(screen.getByTestId("product-grid").textContent).toBe("1");
    expect(fetchPublicOffers).not.toHaveBeenCalled();

    // Scroll the sentinel into view — loads page 2.
    const observer = FakeIntersectionObserver.instances.at(-1);
    await vi.waitFor(() => expect(observer).toBeDefined());
    observer?.trigger(true);
    await vi.waitFor(() =>
      expect(screen.getByTestId("product-grid").textContent).toBe("1,2"),
    );
    expect(fetchPublicOffers).toHaveBeenCalledTimes(1);

    // Simulate navigating to an offer detail page: the listing unmounts.
    unmount();

    // Simulate navigating back: a fresh `CatalogStream` instance mounts with
    // only the server-rendered first page as props (as a real back
    // navigation would initially provide) — but the *same* `queryClient`.
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(CatalogStream, props),
      ),
    );

    // Both pages are restored immediately from the cache, not just page 1,
    // and without re-fetching anything.
    expect(screen.getByTestId("product-grid").textContent).toBe("1,2");
    expect(fetchPublicOffers).toHaveBeenCalledTimes(1);
  });

  it("doesn't let the sentinel fire fetchNextPage while a stale-on-remount background refetch is still in flight", async () => {
    // A short staleTime so remounting with cached data triggers a real
    // background refetch of the already-loaded page — the exact window
    // during which the old `!isFetchingNextPage` sentinel gate stayed
    // (wrongly) enabled, since a *background* refetch isn't a *next-page*
    // fetch. `fetchNextPage()` defaults to `cancelRefetch: true`, so firing
    // it in that window would cancel the refetch instead of just queuing
    // behind it.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 0 } },
    });

    let resolveRefetch!: (value: Awaited<ReturnType<typeof fetchPublicOffers>>) => void;
    vi.mocked(fetchPublicOffers).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefetch = resolve;
        }),
    );

    const props = {
      katalog: "oferta" as const,
      offers: [offer("1")],
      folders: [],
      lastPage: 2,
      sort: "newest" as const,
    };

    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(CatalogStream, props),
      ),
    );

    // The stale `initialData` kicks off a background refetch of page 1 on
    // mount. The sentinel's `useInfiniteSentinel` doesn't even register an
    // `IntersectionObserver` while `enabled` is false — so while that
    // refetch is in flight (`isFetching` true, even though
    // `isFetchingNextPage` is false, since this isn't a next-page fetch),
    // there must be nothing to intersect yet. The old gate (`!loading`,
    // i.e. only `!isFetchingNextPage`) would have left it enabled here,
    // so a restored scroll position near the bottom could have fired
    // `fetchNextPage()` — which defaults to `cancelRefetch: true` — and
    // cancelled the refetch.
    await vi.waitFor(() => expect(fetchPublicOffers).toHaveBeenCalledTimes(1));
    const instancesWhileFetching = FakeIntersectionObserver.instances.length;
    expect(instancesWhileFetching).toBe(0);

    resolveRefetch({
      data: [offer("1")],
      meta: { current_page: 1, last_page: 2, per_page: 16, total: 2 },
    });
    await vi.waitFor(() => expect(screen.getByTestId("product-grid").textContent).toBe("1"));

    // Now that nothing is fetching, the sentinel is live: it registers an
    // observer, and triggering it loads page 2 as normal.
    vi.mocked(fetchPublicOffers).mockResolvedValue({
      data: [offer("2")],
      meta: { current_page: 2, last_page: 2, per_page: 16, total: 2 },
    });
    const observer = await vi.waitFor(() => {
      const instance = FakeIntersectionObserver.instances.at(-1);
      expect(instance).toBeDefined();
      return instance!;
    });
    observer.trigger(true);
    await vi.waitFor(() =>
      expect(screen.getByTestId("product-grid").textContent).toBe("1,2"),
    );
    expect(fetchPublicOffers).toHaveBeenCalledTimes(2);
  });
});
