import { apiFetch } from "@/lib/api";
import type { BizSubscription, Business } from "@/types";

export async function fetchBizBusiness() {
  const payload = await apiFetch<{ data: Business }>("/biz/business", {
    auth: true,
  });
  return payload.data;
}

export async function updateBizLocation(body: {
  street: string | null;
  village: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}) {
  const payload = await apiFetch<{ data: Business }>("/biz/business", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  });
  return payload.data;
}

export async function updateBizLinks(body: {
  website_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  whatsapp: string | null;
}) {
  const payload = await apiFetch<{ data: Business }>("/biz/business/links", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  });
  return payload.data;
}

export async function geocodeBizAddress(address: string) {
  const payload = await apiFetch<{
    data: { latitude: number; longitude: number };
  }>("/biz/business/geocode", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ address }),
  });
  return payload.data;
}

export async function fetchBizSubscription() {
  const payload = await apiFetch<{ data: BizSubscription | null }>(
    "/biz/subscription",
    { auth: true },
  );
  return payload.data;
}
