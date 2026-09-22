import { apiFetch } from "@/lib/api";
import type { OfferFormInput } from "@/schemas/offer";
import type { CategorySummary, Offer, Paginated } from "@/types";
import { fromDateTimeLocalValue } from "@/lib/datetime";

type CategoryListPayload = {
  data: Array<CategorySummary & { is_active?: boolean; sort_order?: number }>;
};

type OfferPayload = { data: Offer };

function toApiBody(input: OfferFormInput) {
  return {
    category_id: input.category_id,
    name: input.name,
    original_price: input.original_price,
    discounted_price: input.discounted_price,
    starts_at: fromDateTimeLocalValue(input.starts_at),
    expires_at: fromDateTimeLocalValue(input.expires_at),
  };
}

export async function fetchBizOffers(perPage = 50): Promise<Paginated<Offer>> {
  return apiFetch<Paginated<Offer>>(`/biz/offers?per_page=${perPage}`, {
    auth: true,
  });
}

export async function fetchBizOffer(id: string): Promise<Offer> {
  const payload = await apiFetch<OfferPayload>(`/biz/offers/${id}`, {
    auth: true,
  });
  return payload.data;
}

export async function createBizOffer(input: OfferFormInput): Promise<Offer> {
  const payload = await apiFetch<OfferPayload>("/biz/offers", {
    method: "POST",
    auth: true,
    body: JSON.stringify(toApiBody(input)),
  });
  return payload.data;
}

export async function updateBizOffer(
  id: string,
  input: OfferFormInput,
): Promise<Offer> {
  const payload = await apiFetch<OfferPayload>(`/biz/offers/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(toApiBody(input)),
  });
  return payload.data;
}

export async function submitBizOffer(id: string): Promise<Offer> {
  const payload = await apiFetch<OfferPayload>(`/biz/offers/${id}/submit`, {
    method: "POST",
    auth: true,
  });
  return payload.data;
}

export async function deleteBizOffer(id: string): Promise<void> {
  await apiFetch<void>(`/biz/offers/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

/** Active categories for the offer form picker. */
export async function fetchActiveCategories(): Promise<CategorySummary[]> {
  const payload = await apiFetch<CategoryListPayload>("/categories");
  return payload.data.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));
}
