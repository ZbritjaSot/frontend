import { apiFetch, ApiError } from "@/lib/api";
import type { HomeSection } from "@/lib/homeSections";
import type {
  CategorySummary,
  Paginated,
  PublicBusiness,
  PublicFolder,
  PublicOffer,
} from "@/types";

const PUBLIC_FETCH: RequestInit = {
  cache: "no-store",
};

export type PublicOfferQuery = {
  q?: string;
  category?: string;
  business?: string;
  city?: string;
  sort?: "newest" | "oldest" | "cheapest" | "discount";
  perPage?: number;
  page?: number;
};

export type PublicHome = {
  hero: PublicOffer | null;
  heroes: PublicOffer[];
  featured: PublicOffer[];
  fresh: PublicOffer[];
  ending_soon: PublicOffer[];
  flyers: PublicFolder[];
  shops: PublicBusiness[];
  categories: CategorySummary[];
  exclusive: ExclusiveItem[];
  sections: HomeSection[];
};

export type ExclusiveItem =
  | { kind: "offer"; offer: PublicOffer }
  | { kind: "flyer"; flyer: PublicFolder };

export async function fetchPublicSections(): Promise<HomeSection[]> {
  const payload = await apiFetch<{ data: HomeSection[] }>("/sections", {
    ...PUBLIC_FETCH,
  });
  return payload.data;
}

export async function fetchPublicHome(): Promise<PublicHome> {
  const payload = await apiFetch<{ data: PublicHome }>("/home", {
    ...PUBLIC_FETCH,
  });
  return payload.data;
}

export async function fetchPublicBusinesses(
  query: { q?: string; city?: string; page?: number; perPage?: number } = {},
): Promise<Paginated<PublicBusiness>> {
  const params = new URLSearchParams();
  params.set("per_page", String(query.perPage ?? 24));
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.city) {
    params.set("city", query.city);
  }
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }

  return apiFetch<Paginated<PublicBusiness>>(`/businesses?${params.toString()}`, {
    ...PUBLIC_FETCH,
  });
}

export async function fetchPublicPlacement(
  query: { page?: number; perPage?: number; q?: string; city?: string } = {},
): Promise<Paginated<ExclusiveItem>> {
  const params = new URLSearchParams();
  params.set("per_page", String(query.perPage ?? 12));
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }
  const q = query.q?.trim();
  if (q) {
    params.set("q", q);
  }
  const city = query.city?.trim();
  if (city) {
    params.set("city", city);
  }

  return apiFetch<Paginated<ExclusiveItem>>(`/placement?${params.toString()}`, {
    ...PUBLIC_FETCH,
  });
}

export async function fetchPublicOffers(
  query: PublicOfferQuery = {},
): Promise<Paginated<PublicOffer>> {
  const params = new URLSearchParams();
  params.set("per_page", String(query.perPage ?? 24));
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.business) {
    params.set("business", query.business);
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

  return apiFetch<Paginated<PublicOffer>>(`/offers?${params.toString()}`, {
    ...PUBLIC_FETCH,
  });
}

export async function fetchPublicCities(options?: { shops?: boolean }): Promise<string[]> {
  const params = new URLSearchParams();
  if (options?.shops) {
    params.set("for", "shops");
  }
  const query = params.toString();
  const payload = await apiFetch<{ data: string[] }>(
    `/cities${query === "" ? "" : `?${query}`}`,
    { ...PUBLIC_FETCH },
  );
  return payload.data;
}

export async function fetchPublicCategories(): Promise<CategorySummary[]> {
  const payload = await apiFetch<{ data: CategorySummary[] }>("/categories", {
    next: { revalidate: 300 },
  });
  return payload.data;
}

export async function fetchPublicBusiness(id: string): Promise<PublicBusiness> {
  const payload = await apiFetch<{ data: PublicBusiness }>(
    `/businesses/${id}`,
    { ...PUBLIC_FETCH },
  );
  return payload.data;
}

export async function fetchPublicFolders(
  query: PublicOfferQuery & { page?: number } = {},
): Promise<Paginated<PublicFolder>> {
  const params = new URLSearchParams();
  params.set("per_page", String(query.perPage ?? 12));
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.business) {
    params.set("business", query.business);
  }
  if (query.city) {
    params.set("city", query.city);
  }
  if (query.sort && query.sort !== "newest") {
    params.set("sort", query.sort);
  }

  return apiFetch<Paginated<PublicFolder>>(
    `/offer-folders?${params.toString()}`,
    { ...PUBLIC_FETCH },
  );
}

export async function fetchPublicFolder(id: string): Promise<PublicFolder> {
  const payload = await apiFetch<{ data: PublicFolder }>(
    `/offer-folders/${id}`,
    { ...PUBLIC_FETCH },
  );
  return payload.data;
}

export async function recordPublicOfferView(id: string): Promise<void> {
  await apiFetch<void>(`/offers/${id}/view`, {
    method: "POST",
    cache: "no-store",
  });
}

export async function fetchPublicRecommended(id: string): Promise<PublicOffer[]> {
  const payload = await apiFetch<{ data: PublicOffer[] }>(`/offers/${id}/recommended`, {
    ...PUBLIC_FETCH,
  });
  return payload.data;
}

export async function fetchPublicOffer(id: string): Promise<PublicOffer> {
  const payload = await apiFetch<{ data: PublicOffer }>(`/offers/${id}`, {
    ...PUBLIC_FETCH,
  });

  return payload.data;
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export { ApiError };
