"use client";

import { useEffect, useRef } from "react";

/** Shared IntersectionObserver sentinel for catalog / exclusive infinite scroll. */
export function useInfiniteSentinel({
  onLoadMore,
  enabled,
  rootMargin = "240px",
}: {
  onLoadMore: () => void | Promise<unknown>;
  enabled: boolean;
  rootMargin?: string;
}) {
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void onLoadMore();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, onLoadMore, rootMargin]);

  return sentinel;
}
