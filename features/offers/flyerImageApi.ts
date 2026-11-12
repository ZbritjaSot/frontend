import { apiFetch } from "@/lib/api";
import type { OfferBundle } from "@/types";

type Audience = "biz" | "admin" | "manager";

function imagePath(audience: Audience, id: string): string {
  if (audience === "admin") {
    return `/admin/offer-bundles/${id}/image`;
  }
  if (audience === "manager") {
    return `/biz/review/${id}/image`;
  }
  return `/biz/offer-bundles/${id}/image`;
}

export async function uploadFlyerImage(
  audience: Audience,
  id: string,
  file: File,
): Promise<OfferBundle> {
  const body = new FormData();
  body.set("image", file);
  const payload = await apiFetch<{ data: OfferBundle }>(imagePath(audience, id), {
    method: "POST",
    auth: true,
    body,
  });
  return payload.data;
}

export async function deleteFlyerImage(audience: Audience, id: string): Promise<OfferBundle> {
  const payload = await apiFetch<{ data: OfferBundle }>(imagePath(audience, id), {
    method: "DELETE",
    auth: true,
  });
  return payload.data;
}
