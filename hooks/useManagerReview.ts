"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveManagerBundle,
  createManagerBundle,
  fetchManagerBundle,
  fetchManagerReview,
  updateManagerBundle,
} from "@/features/biz/managerApi";
import type { OfferBundleFormInput } from "@/schemas/offer";

export const managerReviewKey = ["biz", "review"] as const;

export function managerBundleKey(id: string) {
  return ["biz", "review", id] as const;
}

export function useManagerReview(page = 1, enabled = true) {
  return useQuery({
    queryKey: [...managerReviewKey, page],
    queryFn: () => fetchManagerReview(page),
    placeholderData: (previous) => previous,
    enabled,
  });
}

export function useManagerBundle(id: string) {
  return useQuery({
    queryKey: managerBundleKey(id),
    queryFn: () => fetchManagerBundle(id),
    enabled: Boolean(id),
  });
}

export function useApproveManagerBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveManagerBundle(id),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({ queryKey: managerReviewKey });
      await queryClient.invalidateQueries({ queryKey: managerBundleKey(id) });
    },
  });
}

export function useCreateManagerBundle(businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferBundleFormInput) => createManagerBundle(businessId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: managerReviewKey });
    },
  });
}

export function useUpdateManagerBundle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferBundleFormInput) => updateManagerBundle(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: managerReviewKey });
      await queryClient.invalidateQueries({ queryKey: managerBundleKey(id) });
    },
  });
}
