import { toApiBody } from "@/features/offers/bizApi";
import { apiFetch } from "@/lib/api";
import type { OfferBundleFormInput } from "@/schemas/offer";
import type { OfferBundle, Paginated } from "@/types";

type BundlePayload = { data: OfferBundle };

export const PENDING_OFFERS_PAGE_SIZE = 15;

export async function fetchPendingOffers(
  page = 1,
  perPage = PENDING_OFFERS_PAGE_SIZE,
  q = "",
): Promise<Paginated<OfferBundle>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (q.trim() !== "") {
    params.set("q", q.trim());
  }

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
  q = "",
  status: "approved" | "all" = "approved",
): Promise<Paginated<OfferBundle>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (status === "approved") {
    params.set("status", "approved");
  }
  if (q.trim() !== "") {
    params.set("q", q.trim());
  }

  return apiFetch<Paginated<OfferBundle>>(
    `/admin/offer-bundles?${params.toString()}`,
    { auth: true },
  );
}

export async function updateAdminOfferBundle(
  id: string,
  input: OfferBundleFormInput,
): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(`/admin/offer-bundles/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(toApiBody(input)),
  });
  return payload.data;
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
