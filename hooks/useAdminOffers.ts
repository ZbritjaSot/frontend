"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveOffer,
  fetchPendingOffers,
  rejectOffer,
} from "@/features/admin/offersApi";

export const adminPendingOffersQueryKey = ["admin", "offers", "pending"] as const;

export function usePendingOffers() {
  return useQuery({
    queryKey: adminPendingOffersQueryKey,
    queryFn: () => fetchPendingOffers(),
  });
}

export function useApproveOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveOffer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminPendingOffersQueryKey,
      });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectOffer(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminPendingOffersQueryKey,
      });
    },
  });
}
