"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBizOfferBundle,
  deleteBizOfferBundle,
  fetchActiveCategories,
  fetchBizOfferBundle,
  fetchBizOfferBundles,
  fetchBizOfferViews,
  submitBizOfferBundle,
  updateBizOfferBundle,
  type BundleCatalog,
} from "@/features/offers/bizApi";
import type { OfferBundleFormInput } from "@/schemas/offer";
import type { OfferViewRange } from "@/types";

export const bizOffersQueryKey = ["biz", "offer-bundles"] as const;
export const categoriesQueryKey = ["categories", "active"] as const;

export function useBizOffers(
  page = 1,
  q = "",
  enabled = true,
  status = "",
  catalog: BundleCatalog = "flyers",
) {
  return useQuery({
    queryKey: [...bizOffersQueryKey, catalog, page, q, status],
    queryFn: () =>
      fetchBizOfferBundles(page, undefined, status || undefined, q, catalog),
    placeholderData: (previous) => previous,
    enabled,
  });
}

export function usePendingOfferCount(
  enabled = true,
  catalog?: BundleCatalog,
) {
  return useQuery({
    queryKey: [...bizOffersQueryKey, "by-status", "pending", catalog ?? "all", 4],
    queryFn: () =>
      catalog
        ? fetchBizOfferBundles(1, 4, "pending", "", catalog)
        : fetchBizOfferBundles(1, 4, "pending"),
    select: (page) => page.meta?.total ?? page.data.length,
    enabled,
  });
}

export function useBizOffersByStatus(
  status: string,
  perPage = 4,
  catalog: BundleCatalog = "flyers",
) {
  return useQuery({
    queryKey: [...bizOffersQueryKey, "by-status", catalog, status, perPage],
    queryFn: () => fetchBizOfferBundles(1, perPage, status, "", catalog),
  });
}

export function useBizOfferViews(days: OfferViewRange = 14, offerId?: string) {
  return useQuery({
    queryKey: [...bizOffersQueryKey, "views", days, offerId ?? ""],
    queryFn: () => fetchBizOfferViews(days, offerId),
    placeholderData: (previous) => previous,
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

export function useCreateBizOffer(catalog: BundleCatalog = "flyers") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferBundleFormInput) =>
      createBizOfferBundle(input, catalog),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bizOffersQueryKey });
    },
  });
}

export function useUpdateBizOffer(
  id: string,
  catalog: BundleCatalog = "flyers",
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferBundleFormInput) =>
      updateBizOfferBundle(id, input, catalog),
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
