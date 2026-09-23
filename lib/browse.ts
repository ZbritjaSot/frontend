export function browsePath(
  basePath: string,
  query: { q?: string; category?: string | null },
): string {
  const params = new URLSearchParams();
  const q = query.q?.trim();
  if (q) {
    params.set("q", q);
  }
  if (query.category) {
    params.set("category", query.category);
  }
  const search = params.toString();
  return search === "" ? basePath : `${basePath}?${search}`;
}
