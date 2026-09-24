import { apiFetch, ApiError } from "@/lib/api";
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
  perPage?: number;
  page?: number;
};

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
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }

  return apiFetch<Paginated<PublicOffer>>(`/offers?${params.toString()}`, {
    ...PUBLIC_FETCH,
  });
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
