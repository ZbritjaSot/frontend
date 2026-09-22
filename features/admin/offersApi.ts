import { apiFetch } from "@/lib/api";
import type { Offer, Paginated } from "@/types";

type OfferPayload = { data: Offer };

export async function fetchPendingOffers(
  perPage = 50,
): Promise<Paginated<Offer>> {
  return apiFetch<Paginated<Offer>>(
    `/admin/offers/pending?per_page=${perPage}`,
    { auth: true },
  );
}

export async function approveOffer(id: string): Promise<Offer> {
  const payload = await apiFetch<OfferPayload>(
    `/admin/offers/${id}/approve`,
    { method: "POST", auth: true },
  );
  return payload.data;
}

export async function rejectOffer(
  id: string,
  reason?: string,
): Promise<Offer> {
  const payload = await apiFetch<OfferPayload>(
    `/admin/offers/${id}/reject`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({ reason: reason || null }),
    },
  );
  return payload.data;
}
