type Paginated<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

/**
 * Normalizes an API page into a shape with `meta` always present, so
 * `useInfiniteQuery`'s inferred data type matches between `queryFn` and
 * `initialData` (the API's `meta` is optional; `initialData` always supplies
 * it from server-rendered props, which TypeScript treats as non-optional).
 */
export function normalizePage<T>(
  page: Paginated<T>,
  pageParam: number,
  perPage: number,
): { data: T[]; meta: NonNullable<Paginated<T>["meta"]> } {
  return {
    data: page.data,
    meta: page.meta ?? {
      current_page: pageParam,
      last_page: pageParam,
      per_page: perPage,
      total: page.data.length,
    },
  };
}

/** Flattens `useInfiniteQuery` pages into a deduped list, keyed by `id`. */
export function uniqueById<T extends { id: string }>(
  pages: { data: T[] }[] | undefined,
): T[] {
  const seen = new Set<string>();
  const items: T[] = [];
  for (const page of pages ?? []) {
    for (const item of page.data) {
      if (seen.has(item.id)) {
        continue;
      }
      seen.add(item.id);
      items.push(item);
    }
  }
  return items;
}
