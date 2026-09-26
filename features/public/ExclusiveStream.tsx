"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPublicPlacement, type ExclusiveItem } from "@/features/offers/api";
import { ExclusiveList } from "@/features/public/ExclusiveList";

export function ExclusiveStream({
  items,
  lastPage,
}: {
  items: ExclusiveItem[];
  lastPage: number;
}) {
  const [shown, setShown] = useState(items);
  const [page, setPage] = useState(1);
  const [done, setDone] = useState(lastPage <= 1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
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
      const result = await fetchPublicPlacement({ page: next, perPage: 8 });
      setShown((current) => appendUnique(current, result.data));
      setPage(next);
      setDone(next >= (result.meta?.last_page ?? next));
    } catch {
      setFailed(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [done, page]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || done || failed || loading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [done, failed, loadMore, loading]);

  return (
    <div className="mt-8">
      <ExclusiveList items={shown} />
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
