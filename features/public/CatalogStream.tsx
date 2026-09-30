"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [items, setItems] = useState<PublicOffer[]>(offers);
  const [flyerItems, setFlyerItems] = useState<PublicFolder[]>(folders);
  const [page, setPage] = useState(1);
  const [done, setDone] = useState(lastPage <= 1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || done) {
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    setFailed(false);
    const next = page + 1;
    try {
      if (flyers) {
        const result = await fetchPublicFolders({
          q,
          category,
          city,
          sort,
          page: next,
          perPage: 12,
        });
        setFlyerItems((current) => appendUnique(current, result.data));
        setPage(next);
        setDone(next >= (result.meta?.last_page ?? next));
      } else {
        const result = await fetchPublicOffers({
          q,
          category,
          city,
          sort,
          page: next,
          perPage: 16,
        });
        setItems((current) => appendUnique(current, result.data));
        setPage(next);
        setDone(next >= (result.meta?.last_page ?? next));
      }
    } catch {
      setFailed(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [category, city, done, flyers, page, q, sort]);

  const sentinel = useInfiniteSentinel({
    onLoadMore: loadMore,
    enabled: !done && !failed && !loading,
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
              void loadMore();
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

function appendUnique<T extends { id: string }>(current: T[], next: T[]): T[] {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...next.filter((item) => !seen.has(item.id))];
}
