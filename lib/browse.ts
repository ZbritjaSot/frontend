export type Katalog = "oferta" | "fletushka";

export type CatalogSort = "newest" | "oldest";

export function readSort(value: string | undefined): CatalogSort {
  if (value === "oldest") {
    return value;
  }
  return "newest";
}

export function readKatalog(value: string | undefined): Katalog | undefined {
  if (value === "oferta" || value === "fletushka") {
    return value;
  }
  return undefined;
}

/** Dedicated catalogue routes (replaces `/?katalog=`). */
export function catalogPath(katalog: Katalog): "/oferta" | "/fletushka" {
  return katalog === "fletushka" ? "/fletushka" : "/oferta";
}

/**
 * Category chips / city-sort filters: show when there are results, or when the
 * visitor already filtered (so they can clear). Hide on a totally empty catalogue.
 */
export function showCatalogControls(input: {
  hasResults: boolean;
  q?: string;
  category?: string;
  city?: string;
  sort?: CatalogSort;
}): boolean {
  if (input.hasResults) {
    return true;
  }
  if (input.q?.trim()) {
    return true;
  }
  if (input.category) {
    return true;
  }
  if (input.city) {
    return true;
  }
  if (input.sort && input.sort !== "newest") {
    return true;
  }
  return false;
}

export function browsePath(
  basePath: string,
  query: {
    q?: string;
    category?: string | null;
    page?: number;
    /** When set, path becomes `/oferta` or `/fletushka` (not a query param). */
    katalog?: Katalog | null;
    city?: string | null;
    sort?: CatalogSort | null;
    fp?: number;
  },
): string {
  const path = query.katalog ? catalogPath(query.katalog) : basePath;
  const params = new URLSearchParams();
  const q = query.q?.trim();
  if (q) {
    params.set("q", q);
  }
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.city) {
    params.set("city", query.city);
  }
  if (query.sort && query.sort !== "newest") {
    params.set("sort", query.sort);
  }
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }
  if (query.fp && query.fp > 1) {
    params.set("fp", String(query.fp));
  }
  const search = params.toString();
  return search === "" ? path : `${path}?${search}`;
}

/** Build redirect target from legacy `/?katalog=` URLs. */
export function legacyKatalogRedirect(
  katalog: Katalog,
  params: {
    q?: string;
    category?: string;
    city?: string;
    sort?: string;
    page?: string;
  },
): string {
  return browsePath(catalogPath(katalog), {
    q: params.q,
    category: params.category?.trim() || null,
    city: params.city?.trim() || null,
    sort: readSort(params.sort),
    page: Math.max(1, Number(params.page) || 1),
  });
}
