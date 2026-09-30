"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  favoriteKey,
  isFavoriteStored,
  parseFavoriteKey,
  readFavoriteKeys,
  readFavoriteRefs,
  serverFavoriteKeys,
  subscribeFavorites,
  toggleFavoriteStored,
  type FavoriteKind,
  type FavoriteRef,
} from "@/lib/favorites";

export function useFavorites() {
  const keys = useSyncExternalStore(
    subscribeFavorites,
    readFavoriteKeys,
    serverFavoriteKeys,
  );

  const refs = useMemo(
    () =>
      keys
        .map(parseFavoriteKey)
        .filter((item): item is FavoriteRef => item != null),
    [keys],
  );

  const isFavorite = useCallback(
    (kind: FavoriteKind, id: string) => keys.includes(favoriteKey(kind, id)),
    [keys],
  );

  const toggleFavorite = useCallback((kind: FavoriteKind, id: string) => {
    return toggleFavoriteStored(kind, id);
  }, []);

  return {
    keys,
    refs,
    count: keys.length,
    isFavorite,
    toggleFavorite,
    /** Fresh read — useful after storage events from another tab. */
    refresh: readFavoriteRefs,
  };
}

export function useIsFavorite(kind: FavoriteKind, id: string): boolean {
  const { isFavorite } = useFavorites();
  return isFavorite(kind, id);
}

// Keep a named export for tree-shaking clarity when only checking one item.
export { isFavoriteStored };
