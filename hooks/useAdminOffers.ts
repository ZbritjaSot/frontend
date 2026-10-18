"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveOffer,
  createAdminOfferBundle,
  fetchActiveStores,
  fetchAdminBusinessBundles,
  fetchAdminOfferBundle,
  fetchApprovedOffers,
  fetchPendingOffers,
  takeDownOffer,
  updateAdminOfferBundle,
} from "@/features/admin/offersApi";
import type { BundleCatalog } from "@/features/offers/bizApi";
import type { OfferBundleFormInput } from "@/schemas/offer";

export const adminPendingOffersQueryKey = [
  "admin",
  "offer-bundles",
  "pending",
] as const;

export const adminApprovedOffersQueryKey = [
  "admin",
  "offer-bundles",
  "approved",
] as const;

export const adminOfferBundleQueryKey = (id: string) =>
  ["admin", "offer-bundles", id] as const;

export function usePendingOffers(page = 1, q = "") {
  return useQuery({
    queryKey: [...adminPendingOffersQueryKey, page, q],
    queryFn: () => fetchPendingOffers(page, undefined, q),
    placeholderData: (previous) => previous,
  });
}

export function useApprovedOffers(
  page = 1,
  q = "",
  status: "approved" | "all" = "approved",
) {
  return useQuery({
    queryKey: [
      ...(status === "all"
        ? (["admin", "offer-bundles", "all"] as const)
        : adminApprovedOffersQueryKey),
      page,
      q,
    ],
    queryFn: () => fetchApprovedOffers(page, undefined, q, status),
    placeholderData: (previous) => previous,
  });
}

export const adminBusinessBundlesQueryKey = (
  businessId: string,
  catalog: BundleCatalog,
) => ["admin", "offer-bundles", "business", businessId, catalog] as const;

export function useAdminBusinessBundles(
  businessId: string,
  page = 1,
  q = "",
  status = "",
  catalog: BundleCatalog = "flyers",
) {
  return useQuery({
    queryKey: [...adminBusinessBundlesQueryKey(businessId, catalog), page, q, status],
    queryFn: () =>
      fetchAdminBusinessBundles(businessId, page, undefined, q, status, catalog),
    placeholderData: (previous) => previous,
    enabled: Boolean(businessId),
  });
}

export function useActiveStores() {
  return useQuery({
    queryKey: ["admin", "offer-bundles", "stores"] as const,
    queryFn: fetchActiveStores,
    staleTime: 60_000,
  });
}

export function useCreateAdminOffer(businessId: string, catalog: BundleCatalog) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferBundleFormInput) =>
      createAdminOfferBundle(businessId, input, catalog),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "offer-bundles"] });
    },
  });
}

export function useAdminOfferBundle(id: string) {
  return useQuery({
    queryKey: adminOfferBundleQueryKey(id),
    queryFn: () => fetchAdminOfferBundle(id),
    enabled: Boolean(id),
  });
}

export function useApproveOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveOffer(id),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({
        queryKey: adminPendingOffersQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: adminApprovedOffersQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "offer-bundles", "all"],
      });
      await queryClient.invalidateQueries({
        queryKey: adminOfferBundleQueryKey(id),
      });
    },
  });
}

export function useUpdateAdminOffer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferBundleFormInput) =>
      updateAdminOfferBundle(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "offer-bundles"] });
    },
  });
}

export function useTakeDownOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      takeDownOffer(id, reason),
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: adminApprovedOffersQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "offer-bundles", "all"],
      });
      await queryClient.invalidateQueries({
        queryKey: adminPendingOffersQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: adminOfferBundleQueryKey(id),
      });
    },
  });
}
