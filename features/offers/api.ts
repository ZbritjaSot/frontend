import { apiFetch, ApiError } from "@/lib/api";
import type { Paginated, PublicOffer } from "@/types";

const PUBLIC_FETCH: RequestInit = {
  cache: "no-store",
};

export async function fetchPublicOffers(
  perPage = 24,
): Promise<Paginated<PublicOffer>> {
  return apiFetch<Paginated<PublicOffer>>(`/offers?per_page=${perPage}`, {
    ...PUBLIC_FETCH,
  });
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
