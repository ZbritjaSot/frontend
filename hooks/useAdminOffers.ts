"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveOffer,
  fetchAdminOfferBundle,
  fetchApprovedOffers,
  fetchPendingOffers,
  rejectOffer,
  takeDownOffer,
} from "@/features/admin/offersApi";

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

export function usePendingOffers(page = 1) {
  return useQuery({
    queryKey: [...adminPendingOffersQueryKey, page],
    queryFn: () => fetchPendingOffers(page),
    placeholderData: (previous) => previous,
  });
}

export function useApprovedOffers(page = 1) {
  return useQuery({
    queryKey: [...adminApprovedOffersQueryKey, page],
    queryFn: () => fetchApprovedOffers(page),
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
        queryKey: adminOfferBundleQueryKey(id),
      });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reason,
      item_ids,
    }: {
      id: string;
      reason?: string;
      item_ids: string[];
    }) => rejectOffer(id, { reason, item_ids }),
    onSuccess: async (_data, { id }) => {
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
        queryKey: adminPendingOffersQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: adminOfferBundleQueryKey(id),
      });
    },
  });
}
