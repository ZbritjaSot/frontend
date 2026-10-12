import { apiFetch } from "@/lib/api";
import { toApiBody, type BundleCatalog } from "@/features/offers/bizApi";
import type { OfferBundleFormInput } from "@/schemas/offer";
import type { CompanyShop, OfferBundle, OfferImage, Paginated } from "@/types";

type BundlePayload = { data: OfferBundle };

export async function fetchManagerReview(
  page = 1,
  status: "pending" | "approved" | "all" = "pending",
  q = "",
  catalog?: BundleCatalog,
): Promise<Paginated<OfferBundle>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: "15",
  });
  if (status !== "pending") {
    params.set("status", status);
  }
  if (q.trim() !== "") {
    params.set("q", q.trim());
  }
  if (catalog) {
    params.set("kind", catalog);
  }
  return apiFetch<Paginated<OfferBundle>>(`/biz/review?${params.toString()}`, {
    auth: true,
  });
}

export async function createManagerBundle(
  businessId: string,
  input: OfferBundleFormInput,
  catalog: BundleCatalog = "flyers",
): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(`/biz/review/companies/${businessId}`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(toApiBody(input, catalog)),
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

export async function fetchManagerGallery(
  businessId: string,
  params?: { q?: string; page?: number; per_page?: number },
): Promise<Paginated<OfferImage>> {
  const qs = new URLSearchParams();
  if (params?.q?.trim()) {
    qs.set("q", params.q.trim());
  }
  if (params?.page && params.page > 1) {
    qs.set("page", String(params.page));
  }
  if (params?.per_page) {
    qs.set("per_page", String(params.per_page));
  }
  const query = qs.toString();
  return apiFetch<Paginated<OfferImage>>(
    `/biz/review/companies/${businessId}/gallery${query ? `?${query}` : ""}`,
    { auth: true },
  );
}

export async function uploadManagerGallery(
  businessId: string,
  file: File,
  title?: string | null,
): Promise<OfferImage> {
  const body = new FormData();
  body.set("image", file);
  if (title?.trim()) {
    body.set("title", title.trim());
  }
  const payload = await apiFetch<{ data: OfferImage }>(
    `/biz/review/companies/${businessId}/gallery`,
    { method: "POST", auth: true, body },
  );
  return payload.data;
}
