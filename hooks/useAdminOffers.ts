"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveOffer,
  fetchAdminOfferBundle,
  fetchPendingOffers,
  rejectOffer,
} from "@/features/admin/offersApi";

export const adminPendingOffersQueryKey = [
  "admin",
  "offer-bundles",
  "pending",
] as const;

export const adminOfferBundleQueryKey = (id: string) =>
  ["admin", "offer-bundles", id] as const;

export function usePendingOffers() {
  return useQuery({
    queryKey: adminPendingOffersQueryKey,
    queryFn: () => fetchPendingOffers(),
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
