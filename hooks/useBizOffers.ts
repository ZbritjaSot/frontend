"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBizOfferBundle,
  deleteBizOfferBundle,
  fetchActiveCategories,
  fetchBizOfferBundle,
  fetchBizOfferBundles,
  submitBizOfferBundle,
  updateBizOfferBundle,
} from "@/features/offers/bizApi";
import type { OfferBundleFormInput } from "@/schemas/offer";

export const bizOffersQueryKey = ["biz", "offer-bundles"] as const;
export const categoriesQueryKey = ["categories", "active"] as const;

export function useBizOffers(page = 1) {
  return useQuery({
    queryKey: [...bizOffersQueryKey, page],
    queryFn: () => fetchBizOfferBundles(page),
    placeholderData: (previous) => previous,
  });
}

export function useRejectedOfferCount() {
  return useQuery({
    queryKey: [...bizOffersQueryKey, "by-status", "rejected", 4],
    queryFn: () => fetchBizOfferBundles(1, 4, "rejected"),
    select: (page) => page.meta?.total ?? page.data.length,
  });
}

export function useBizOffersByStatus(status: string, perPage = 4) {
  return useQuery({
    queryKey: [...bizOffersQueryKey, "by-status", status, perPage],
    queryFn: () => fetchBizOfferBundles(1, perPage, status),
  });
}

export function useBizOffer(id: string) {
  return useQuery({
    queryKey: [...bizOffersQueryKey, id],
    queryFn: () => fetchBizOfferBundle(id),
    enabled: Boolean(id),
  });
}

export function useActiveCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchActiveCategories,
    staleTime: 60_000,
  });
}

export function useCreateBizOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferBundleFormInput) => createBizOfferBundle(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bizOffersQueryKey });
    },
  });
}

export function useUpdateBizOffer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferBundleFormInput) =>
      updateBizOfferBundle(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bizOffersQueryKey });
    },
  });
}

export function useSubmitBizOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => submitBizOfferBundle(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bizOffersQueryKey });
    },
  });
}

export function useDeleteBizOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBizOfferBundle(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bizOffersQueryKey });
    },
  });
}
