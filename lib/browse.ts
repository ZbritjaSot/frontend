export type Katalog = "oferta" | "fletushka";

export type CatalogSort = "newest" | "cheapest" | "discount";

export function readSort(value: string | undefined): CatalogSort {
  if (value === "cheapest" || value === "discount") {
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

export function browsePath(
  basePath: string,
  query: {
    q?: string;
    category?: string | null;
    page?: number;
    katalog?: Katalog | null;
    city?: string | null;
    sort?: CatalogSort | null;
    fp?: number;
  },
): string {
  const params = new URLSearchParams();
  const q = query.q?.trim();
  if (q) {
    params.set("q", q);
  }
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.katalog) {
    params.set("katalog", query.katalog);
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
  return search === "" ? basePath : `${basePath}?${search}`;
}
