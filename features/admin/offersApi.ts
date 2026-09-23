import { apiFetch } from "@/lib/api";
import type { OfferBundle, Paginated } from "@/types";

type BundlePayload = { data: OfferBundle };

export async function fetchPendingOffers(
  perPage = 50,
): Promise<Paginated<OfferBundle>> {
  return apiFetch<Paginated<OfferBundle>>(
    `/admin/offer-bundles/pending?per_page=${perPage}`,
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
