import { apiFetch } from "@/lib/api";
import type { OfferBundleFormInput } from "@/schemas/offer";
import type {
  CategorySummary,
  OfferBundle,
  OfferViewRange,
  OfferViewSummary,
  Paginated,
} from "@/types";
import { fromDateTimeLocalValue } from "@/lib/datetime";

type CategoryListPayload = {
  data: Array<CategorySummary & { is_active?: boolean; sort_order?: number }>;
};

type BundlePayload = { data: OfferBundle };

export function toApiBody(input: OfferBundleFormInput) {
  return {
    title: input.title,
    starts_at: fromDateTimeLocalValue(input.starts_at),
    expires_at: fromDateTimeLocalValue(input.expires_at),
    cover_gallery_image_id: input.cover_gallery_image_id ?? null,
    items: input.items.map((item) => ({
      category_id: item.category_id,
      name: item.name,
      original_price: item.original_price,
      discounted_price: item.discounted_price,
      discount_percent: item.discount_percent,
      gallery_image_id: item.gallery_image_id ?? null,
    })),
  };
}

export const BIZ_OFFERS_PAGE_SIZE = 15;

export async function fetchBizOfferBundles(
  page = 1,
  perPage = BIZ_OFFERS_PAGE_SIZE,
  status?: string,
): Promise<Paginated<OfferBundle>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (status) {
    params.set("status", status);
  }

  return apiFetch<Paginated<OfferBundle>>(
    `/biz/offer-bundles?${params.toString()}`,
    { auth: true },
  );
}

export async function fetchBizOfferViews(
  days: OfferViewRange = 14,
  offerId?: string,
): Promise<OfferViewSummary> {
  const params = new URLSearchParams({ days: String(days) });
  if (offerId) {
    params.set("offer", offerId);
  }
  const payload = await apiFetch<{ data: OfferViewSummary }>(
    `/biz/offer-views?${params.toString()}`,
    { auth: true },
  );
  return payload.data;
}

export async function fetchBizOfferBundle(id: string): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(`/biz/offer-bundles/${id}`, {
    auth: true,
  });
  return payload.data;
}

export async function createBizOfferBundle(
  input: OfferBundleFormInput,
): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>("/biz/offer-bundles", {
    method: "POST",
    auth: true,
    body: JSON.stringify(toApiBody(input)),
  });
  return payload.data;
}

export async function updateBizOfferBundle(
  id: string,
  input: OfferBundleFormInput,
): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(`/biz/offer-bundles/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(toApiBody(input)),
  });
  return payload.data;
}

export async function submitBizOfferBundle(id: string): Promise<OfferBundle> {
  const payload = await apiFetch<BundlePayload>(
    `/biz/offer-bundles/${id}/submit`,
    { method: "POST", auth: true },
  );
  return payload.data;
}

export async function deleteBizOfferBundle(id: string): Promise<void> {
  await apiFetch<void>(`/biz/offer-bundles/${id}`, {
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

/** @deprecated aliases */
export const fetchBizOffers = fetchBizOfferBundles;
export const fetchBizOffer = fetchBizOfferBundle;
export const createBizOffer = createBizOfferBundle;
export const updateBizOffer = updateBizOfferBundle;
export const submitBizOffer = submitBizOfferBundle;
export const deleteBizOffer = deleteBizOfferBundle;
