export function browsePath(
  basePath: string,
  query: { q?: string; category?: string | null; page?: number },
): string {
  const params = new URLSearchParams();
  const q = query.q?.trim();
  if (q) {
    params.set("q", q);
  }
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }
  const search = params.toString();
  return search === "" ? basePath : `${basePath}?${search}`;
}
