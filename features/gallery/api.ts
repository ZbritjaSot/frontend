import { apiFetch } from "@/lib/api";
import type { Business, OfferImage } from "@/types";

type GalleryPayload = { data: OfferImage[] };
type ImagePayload = { data: OfferImage };
type BusinessPayload = { data: Business };

function imageBody(file: File): FormData {
  const body = new FormData();
  body.set("image", file);
  return body;
}

export async function fetchBizGallery(): Promise<OfferImage[]> {
  const payload = await apiFetch<GalleryPayload>("/biz/gallery", { auth: true });
  return payload.data;
}

export async function deleteBizGallery(imageId: string): Promise<void> {
  await apiFetch<void>(`/biz/gallery/${imageId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function uploadBizGallery(file: File): Promise<OfferImage> {
  const payload = await apiFetch<ImagePayload>("/biz/gallery", {
    method: "POST",
    auth: true,
    body: imageBody(file),
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

export async function fetchAdminGallery(businessId: string): Promise<OfferImage[]> {
  const payload = await apiFetch<GalleryPayload>(
    `/admin/businesses/${businessId}/gallery`,
    { auth: true },
  );
  return payload.data;
}

export async function uploadAdminGallery(
  businessId: string,
  file: File,
): Promise<OfferImage> {
  const payload = await apiFetch<ImagePayload>(
    `/admin/businesses/${businessId}/gallery`,
    {
      method: "POST",
      auth: true,
      body: imageBody(file),
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
