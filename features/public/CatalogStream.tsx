"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchPublicFolders,
  fetchPublicOffers,
} from "@/features/offers/api";
import {
  CampaignGrid,
  CampaignPoster,
} from "@/features/public/CampaignPoster";
import { ProductGrid } from "@/features/public/ProductPoster";
import type { CatalogSort, Katalog } from "@/lib/browse";
import { normalizePage, uniqueById } from "@/lib/pages";
import { useInfiniteSentinel } from "@/lib/useInfiniteSentinel";
import type { PublicFolder, PublicOffer } from "@/types";

type CatalogStreamProps = {
  katalog: Katalog;
  offers: PublicOffer[];
  folders: PublicFolder[];
  lastPage: number;
  q?: string;
  category?: string;
  city?: string;
  sort: CatalogSort;
};

export function CatalogStream({
  katalog,
  offers,
  folders,
  lastPage,
  q,
  category,
  city,
  sort,
}: CatalogStreamProps) {
  const flyers = katalog === "fletushka";

  // Keeping both `useInfiniteQuery` calls mounted (gated by `enabled`) mirrors
  // the mobile `CatalogScreen` pattern. The query cache lives in the root
  // `QueryClientProvider` (`components/providers.tsx`), which isn't remounted
  // on client-side navigation — so navigating to an offer/flyer detail page
  // and back restores every previously-loaded page and scroll position
  // without any URL param or custom scroll-restoration code.
  const offersQuery = useInfiniteQuery({
    queryKey: ["catalog-offers", q ?? "", category ?? "", city ?? "", sort],
    queryFn: async ({ pageParam }) =>
      normalizePage(
        await fetchPublicOffers({ q, category, city, sort, page: pageParam, perPage: 16 }),
        pageParam,
        16,
      ),
    initialPageParam: 1,
    getNextPageParam: (last, _pages, page) =>
      page < (last.meta?.last_page ?? page) ? page + 1 : undefined,
    enabled: !flyers,
    initialData: !flyers
      ? () => ({
          pages: [
            {
              data: offers,
              meta: {
                current_page: 1,
                last_page: lastPage,
                per_page: 16,
                total: offers.length,
              },
            },
          ],
          pageParams: [1],
        })
      : undefined,
  });

  const foldersQuery = useInfiniteQuery({
    queryKey: ["catalog-folders", q ?? "", category ?? "", city ?? "", sort],
    queryFn: async ({ pageParam }) =>
      normalizePage(
        await fetchPublicFolders({ q, category, city, sort, page: pageParam, perPage: 12 }),
        pageParam,
        12,
      ),
    initialPageParam: 1,
    getNextPageParam: (last, _pages, page) =>
      page < (last.meta?.last_page ?? page) ? page + 1 : undefined,
    enabled: flyers,
    initialData: flyers
      ? () => ({
          pages: [
            {
              data: folders,
              meta: {
                current_page: 1,
                last_page: lastPage,
                per_page: 12,
                total: folders.length,
              },
            },
          ],
          pageParams: [1],
        })
      : undefined,
  });

  const active = flyers ? foldersQuery : offersQuery;
  const items = useMemo(() => uniqueById(offersQuery.data?.pages), [offersQuery.data]);
  const flyerItems = useMemo(() => uniqueById(foldersQuery.data?.pages), [foldersQuery.data]);

  const loading = active.isFetchingNextPage;
  const failed = active.isFetchNextPageError;
  // Gated on the query's overall `isFetching` (not just `isFetchingNextPage`)
  // so the sentinel can't fire `fetchNextPage()` — which defaults to
  // `cancelRefetch: true` — while a stale-on-remount background refetch of
  // the already-loaded pages is still in flight; that would cancel it and
  // can drop or mix in stale data. The visible "Duke ngarkuar…" spinner
  // still only reflects `isFetchingNextPage`, not this broader gate.
  const activeFetchNextPage = active.fetchNextPage;
  const onLoadMore = useCallback(() => activeFetchNextPage(), [activeFetchNextPage]);
  const sentinel = useInfiniteSentinel({
    onLoadMore,
    enabled: Boolean(active.hasNextPage) && !active.isFetching && !failed,
  });

  return (
    <div className="mt-6">
      {flyers && flyerItems.length > 0 ? (
        <div className="grid gap-4">
          <CampaignPoster folder={flyerItems[0]} layout="feature" eager />
          <CampaignGrid folders={flyerItems.slice(1)} />
        </div>
      ) : null}
      {!flyers && items.length > 0 ? (
        <ProductGrid offers={items} priorityFirst />
      ) : null}
      <div ref={sentinel} className="h-8" />
      {loading ? (
        <p className="m-0 text-center text-sm font-semibold text-muted">
          Duke ngarkuar…
        </p>
      ) : null}
      {failed ? (
        <p className="m-0 text-center">
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent text-sm font-semibold text-ink underline"
            onClick={() => {
              void active.fetchNextPage();
            }}
          >
            Provo përsëri
          </button>
        </p>
      ) : null}
      <BackToTop />
    </div>
  );
}

function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShown(window.scrollY > 640);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!shown) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Kthehu në krye"
      className="fixed right-5 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-30 inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-accent text-charcoal shadow-[0_8px_24px_rgba(0,0,0,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
    >
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
        <path
          d="M8 3.5 3 8.5l1.1 1.1L7.2 6.5V13h1.6V6.5l3.1 3.1L13 8.5 8 3.5Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}
