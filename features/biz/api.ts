import { apiFetch } from "@/lib/api";
import type { BizSubscription, Business } from "@/types";

export async function fetchBizBusiness() {
  const payload = await apiFetch<{ data: Business }>("/biz/business", {
    auth: true,
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
