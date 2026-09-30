import { apiFetch } from "@/lib/api";
import type { Business, OfferImage, Paginated } from "@/types";

type ImagePayload = { data: OfferImage };
type BusinessPayload = { data: Business };

export type GalleryQuery = {
  q?: string;
  page?: number;
  per_page?: number;
};

function galleryQueryString(params?: GalleryQuery): string {
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
  return query ? `?${query}` : "";
}

function imageBody(file: File, title?: string | null): FormData {
  const body = new FormData();
  body.set("image", file);
  if (title?.trim()) {
    body.set("title", title.trim());
  }
  return body;
}

export async function fetchBizGallery(
  params?: GalleryQuery,
): Promise<Paginated<OfferImage>> {
  return apiFetch<Paginated<OfferImage>>(
    `/biz/gallery${galleryQueryString(params)}`,
    { auth: true },
  );
}

export async function fetchBizPlatformGallery(
  params?: GalleryQuery,
): Promise<Paginated<OfferImage>> {
  return apiFetch<Paginated<OfferImage>>(
    `/biz/platform-gallery${galleryQueryString(params)}`,
    { auth: true },
  );
}

export async function uploadBizGallery(
  file: File,
  title?: string | null,
): Promise<OfferImage> {
  const payload = await apiFetch<ImagePayload>("/biz/gallery", {
    method: "POST",
    auth: true,
    body: imageBody(file, title),
  });
  return payload.data;
}

export async function uploadBizLogo(file: File): Promise<Business> {
  const payload = await apiFetch<BusinessPayload>("/biz/business/logo", {
    method: "POST",
    auth: true,
    body: imageBody(file),
  });
  return payload.data;
}

export async function deleteBizLogo(): Promise<void> {
  await apiFetch<void>("/biz/business/logo", {
    method: "DELETE",
    auth: true,
  });
}

export async function fetchAdminGallery(
  businessId: string,
  params?: GalleryQuery,
): Promise<Paginated<OfferImage>> {
  return apiFetch<Paginated<OfferImage>>(
    `/admin/businesses/${businessId}/gallery${galleryQueryString(params)}`,
    { auth: true },
  );
}

export async function uploadAdminGallery(
  businessId: string,
  file: File,
  title?: string | null,
): Promise<OfferImage> {
  const payload = await apiFetch<ImagePayload>(
    `/admin/businesses/${businessId}/gallery`,
    {
      method: "POST",
      auth: true,
      body: imageBody(file, title),
    },
  );
  return payload.data;
}

export async function deleteAdminGallery(
  businessId: string,
  imageId: string,
): Promise<void> {
  await apiFetch<void>(`/admin/businesses/${businessId}/gallery/${imageId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function fetchAdminPlatformGallery(
  params?: GalleryQuery,
): Promise<Paginated<OfferImage>> {
  return apiFetch<Paginated<OfferImage>>(
    `/admin/platform-gallery${galleryQueryString(params)}`,
    { auth: true },
  );
}

export async function uploadAdminPlatformGallery(
  file: File,
  title: string,
): Promise<OfferImage> {
  const payload = await apiFetch<ImagePayload>("/admin/platform-gallery", {
    method: "POST",
    auth: true,
    body: imageBody(file, title),
  });
  return payload.data;
}

export async function updateAdminPlatformGallery(
  imageId: string,
  data: { title?: string },
): Promise<OfferImage> {
  const payload = await apiFetch<ImagePayload>(
    `/admin/platform-gallery/${imageId}`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(data),
    },
  );
  return payload.data;
}

export async function deleteAdminPlatformGallery(imageId: string): Promise<void> {
  await apiFetch<void>(`/admin/platform-gallery/${imageId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function uploadAdminLogo(
  businessId: string,
  file: File,
): Promise<Business> {
  const payload = await apiFetch<BusinessPayload>(
    `/admin/businesses/${businessId}/logo`,
    {
      method: "POST",
      auth: true,
      body: imageBody(file),
    },
  );
  return payload.data;
}

export async function deleteAdminLogo(businessId: string): Promise<void> {
  await apiFetch<void>(`/admin/businesses/${businessId}/logo`, {
    method: "DELETE",
    auth: true,
  });
}
