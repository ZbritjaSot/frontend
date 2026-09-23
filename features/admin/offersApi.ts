import { apiFetch } from "@/lib/api";
import type { OfferBundle, Paginated } from "@/types";

type BundlePayload = { data: OfferBundle };

export const PENDING_OFFERS_PAGE_SIZE = 15;

export async function fetchPendingOffers(
  page = 1,
  perPage = PENDING_OFFERS_PAGE_SIZE,
): Promise<Paginated<OfferBundle>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  return apiFetch<Paginated<OfferBundle>>(
    `/admin/offer-bundles/pending?${params.toString()}`,
    { auth: true },
  );
}

export async function fetchAdminOfferBundle(id: string): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(
    `/admin/offer-bundles/${id}`,
    { auth: true },
  );
  return payload.data;
}

export async function approveOffer(id: string): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(
    `/admin/offer-bundles/${id}/approve`,
    { method: "POST", auth: true },
  );
  return payload.data;
}

export async function fetchApprovedOffers(
  page = 1,
  perPage = PENDING_OFFERS_PAGE_SIZE,
): Promise<Paginated<OfferBundle>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    status: "approved",
  });

  return apiFetch<Paginated<OfferBundle>>(
    `/admin/offer-bundles?${params.toString()}`,
    { auth: true },
  );
}

export async function rejectOffer(
  id: string,
  payload: { reason?: string; item_ids: string[] },
): Promise<OfferBundle> {
  const body = await apiFetch<BundlePayload>(
    `/admin/offer-bundles/${id}/reject`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        reason: payload.reason || null,
        item_ids: payload.item_ids,
      }),
    },
  );
  return body.data;
}

export async function takeDownOffer(
  id: string,
  reason: string,
): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(
    `/admin/offer-bundles/${id}/take-down`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({ reason }),
    },
  );
  return payload.data;
}
