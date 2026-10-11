"use client";

import { useCallback, useRef, useState } from "react";
import { fetchPublicPlacement, type ExclusiveItem } from "@/features/offers/api";
import { EXCLUSIVE_PAGE_SIZE } from "@/features/public/exclusiveConstants";
import { ExclusiveStage } from "@/features/public/ExclusiveStage";
import { useInfiniteSentinel } from "@/lib/useInfiniteSentinel";

export function ExclusiveStream({
  items,
  lastPage,
  q = "",
  city = "",
}: {
  items: ExclusiveItem[];
  lastPage: number;
  q?: string;
  city?: string;
}) {
  const [shown, setShown] = useState(items);
  const [page, setPage] = useState(1);
  const [done, setDone] = useState(lastPage <= 1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadingRef = useRef(false);
  const query = q.trim();
  const place = city.trim();

  const loadMore = useCallback(async () => {
    if (loadingRef.current || done) {
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    setFailed(false);
    const next = page + 1;
    try {
      const result = await fetchPublicPlacement({
        page: next,
        perPage: EXCLUSIVE_PAGE_SIZE,
        q: query || undefined,
        city: place || undefined,
      });
      setShown((current) => appendUnique(current, result.data));
      setPage(next);
      setDone(next >= (result.meta?.last_page ?? next));
    } catch {
      setFailed(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [done, page, place, query]);

  const sentinel = useInfiniteSentinel({
    onLoadMore: loadMore,
    enabled: !done && !failed && !loading,
  });

  return (
    <div>
      <ExclusiveStage items={shown} hasMore={!done} />
      <div ref={sentinel} className="h-8" />
      {loading ? (
        <p className="m-0 text-center text-sm font-semibold text-muted">Duke ngarkuar…</p>
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
    </div>
  );
}

function itemKey(item: ExclusiveItem): string {
  return item.kind === "flyer" ? `flyer:${item.flyer.id}` : `offer:${item.offer.id}`;
}

function appendUnique(current: ExclusiveItem[], next: ExclusiveItem[]): ExclusiveItem[] {
  const seen = new Set(current.map(itemKey));
  return [...current, ...next.filter((item) => !seen.has(itemKey(item)))];
}
