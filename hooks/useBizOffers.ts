"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBizOffer,
  deleteBizOffer,
  fetchActiveCategories,
  fetchBizOffer,
  fetchBizOffers,
  submitBizOffer,
  updateBizOffer,
} from "@/features/offers/bizApi";
import type { OfferFormInput } from "@/schemas/offer";

export const bizOffersQueryKey = ["biz", "offers"] as const;
export const categoriesQueryKey = ["categories", "active"] as const;

export function useBizOffers() {
  return useQuery({
    queryKey: bizOffersQueryKey,
    queryFn: () => fetchBizOffers(),
  });
}

export function useBizOffer(id: string) {
  return useQuery({
    queryKey: [...bizOffersQueryKey, id],
    queryFn: () => fetchBizOffer(id),
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
    mutationFn: (input: OfferFormInput) => createBizOffer(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bizOffersQueryKey });
    },
  });
}

export function useUpdateBizOffer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferFormInput) => updateBizOffer(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bizOffersQueryKey });
    },
  });
}

export function useSubmitBizOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => submitBizOffer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bizOffersQueryKey });
    },
  });
}

export function useDeleteBizOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBizOffer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bizOffersQueryKey });
    },
  });
}
