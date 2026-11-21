"use client";

import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

/** False during SSR and the hydration pass, true once the client has taken over.
 * Lets a client-only store (e.g. favourites in localStorage) show a skeleton
 * instead of a server-rendered "empty" that would flash away on hydration. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
