"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchPublicFoldersBatch,
  fetchPublicOffersBatch,
  isBatchableId,
} from "@/features/offers/api";
import type { FavoriteRef } from "@/lib/favorites";
import type { PublicFolder, PublicOffer } from "@/types";

function idsOf(refs: FavoriteRef[], kind: FavoriteRef["kind"]): string[] {
  return refs.filter((item) => item.kind === kind).map((item) => item.id);
}

function useBatch<T extends { id: string }>(
  kind: "offer" | "flyer",
  ids: string[],
  fetcher: (ids: string[]) => Promise<T[]>,
) {
  // Ids that are not uuids can never resolve (and would 422 the whole batch).
  // Sorted + lowercased (the API lowercases too) so the key is order-independent.
  const batchable = ids
    .filter(isBatchableId)
    .map((id) => id.toLowerCase())
    .sort();
  const query = useQuery({
    queryKey: ["favorites-batch", kind, batchable],
    queryFn: () => fetcher(batchable),
    enabled: batchable.length > 0,
    retry: false,
    staleTime: 60_000,
    // Un/re-favouriting changes the key; keep showing the last result meanwhile.
    placeholderData: keepPreviousData,
  });

  const wanted = new Set(batchable);
  // The API answers in the (sorted) request order; show the stored save order
  // instead, so an undone item lands at the end. Unknown ids sort last.
  const order = new Map(ids.map((id, index) => [id.toLowerCase(), index]));
  const rank = (item: T) => order.get(item.id.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
  const items = (query.data ?? [])
    .filter((item) => wanted.has(item.id.toLowerCase()))
    .sort((a, b) => rank(a) - rank(b));
  const returned = new Set(items.map((item) => item.id.toLowerCase()));
  // Only a settled, non-placeholder response can say an id is gone.
  const settled = query.isSuccess && !query.isPlaceholderData;
  // Non-uuid ids are always missing (they could never resolve); the rest only
  // once a real response is in. Original casing is kept so storage can match it.
  const missing = ids.filter((id) =>
    isBatchableId(id) ? settled && !returned.has(id.toLowerCase()) : true,
  );

  return {
    items,
    missing,
    // Also loading while placeholder data leaves nothing to show and new ids are in flight.
    loading:
      batchable.length > 0 &&
      (query.isPending || (query.isPlaceholderData && query.isFetching && items.length === 0)),
    error: query.isError ? query.error : null,
    refetch: query.refetch,
  };
}

/** One batch request per kind (instead of one per favourite). `missing` lists
 * ids (as stored) the API did not return (expired/removed/invalid) — the caller prunes them. */
export function useFavoriteItems(refs: FavoriteRef[]) {
  const offers = useBatch<PublicOffer>("offer", idsOf(refs, "offer"), fetchPublicOffersBatch);
  const flyers = useBatch<PublicFolder>("flyer", idsOf(refs, "flyer"), fetchPublicFoldersBatch);
  return { offers, flyers };
}
