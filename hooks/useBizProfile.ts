"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBizBusiness, fetchBizSubscription } from "@/features/biz/api";

export const bizBusinessQueryKey = ["biz", "business"] as const;
export const bizSubscriptionQueryKey = ["biz", "subscription"] as const;

export function useBizBusiness() {
  return useQuery({
    queryKey: bizBusinessQueryKey,
    queryFn: () => fetchBizBusiness(),
  });
}

export function useBizSubscription() {
  return useQuery({
    queryKey: bizSubscriptionQueryKey,
    queryFn: () => fetchBizSubscription(),
  });
}
