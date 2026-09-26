"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveOffer,
  fetchAdminOfferBundle,
  fetchApprovedOffers,
  fetchPendingOffers,
  takeDownOffer,
  updateAdminOfferBundle,
} from "@/features/admin/offersApi";
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
      await queryClient.invalidateQueries({
        queryKey: adminPendingOffersQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: adminOfferBundleQueryKey(id),
      });
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
