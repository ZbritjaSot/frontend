export type Katalog = "oferta" | "fletushka";

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
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }
  if (query.fp && query.fp > 1) {
    params.set("fp", String(query.fp));
  }
  const search = params.toString();
  return search === "" ? basePath : `${basePath}?${search}`;
}
