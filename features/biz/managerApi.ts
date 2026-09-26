import { apiFetch } from "@/lib/api";
import { toApiBody } from "@/features/offers/bizApi";
import type { OfferBundleFormInput } from "@/schemas/offer";
import type { CompanyShop, OfferBundle, OfferImage, Paginated } from "@/types";

type BundlePayload = { data: OfferBundle };

export async function fetchManagerReview(page = 1): Promise<Paginated<OfferBundle>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: "15",
  });
  return apiFetch<Paginated<OfferBundle>>(`/biz/review?${params.toString()}`, {
    auth: true,
  });
}

export async function createManagerBundle(
  businessId: string,
  input: OfferBundleFormInput,
): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(`/biz/review/companies/${businessId}`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(toApiBody(input)),
  });
  return payload.data;
}

export async function fetchManagerBundle(id: string): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(`/biz/review/${id}`, { auth: true });
  return payload.data;
}

export async function updateManagerBundle(
  id: string,
  input: OfferBundleFormInput,
): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(`/biz/review/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(toApiBody(input)),
  });
  return payload.data;
}

export async function approveManagerBundle(id: string): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(`/biz/review/${id}/approve`, {
    method: "POST",
    auth: true,
  });
  return payload.data;
}

export async function fetchManagerCompanyShops(businessId: string): Promise<CompanyShop[]> {
  const payload = await apiFetch<{ data: CompanyShop[] }>(
    `/biz/review/companies/${businessId}/shops`,
    { auth: true },
  );
  return payload.data;
}

export async function fetchManagerGallery(businessId: string): Promise<OfferImage[]> {
  const payload = await apiFetch<{ data: OfferImage[] }>(
    `/biz/review/companies/${businessId}/gallery`,
    { auth: true },
  );
  return payload.data;
}

export async function uploadManagerGallery(
  businessId: string,
  file: File,
): Promise<OfferImage> {
  const body = new FormData();
  body.set("image", file);
  const payload = await apiFetch<{ data: OfferImage }>(
    `/biz/review/companies/${businessId}/gallery`,
    { method: "POST", auth: true, body },
  );
  return payload.data;
}
