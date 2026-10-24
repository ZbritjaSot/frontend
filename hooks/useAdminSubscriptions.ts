"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminBusinesses } from "@/features/admin/businessesApi";
import {
  createSubscription,
  fetchAdminSubscriptions,
  updateSubscription,
} from "@/features/admin/subscriptionsApi";
import type { SubscriptionWriteInput } from "@/features/admin/subscriptionsApi";

export const adminSubscriptionsQueryKey = [
  "admin",
  "subscriptions",
] as const;
export const adminBusinessesQueryKey = ["admin", "businesses"] as const;

export function useAdminSubscriptions(q = "") {
  return useQuery({
    queryKey: [...adminSubscriptionsQueryKey, q],
    queryFn: () => fetchAdminSubscriptions({ q }),
  });
}

export function useAdminBusinesses() {
  return useQuery({
    queryKey: adminBusinessesQueryKey,
    queryFn: () => fetchAdminBusinesses(1, 50),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubscriptionWriteInput) => createSubscription(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminSubscriptionsQueryKey,
      });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      starts_at?: string;
      ends_at?: string;
      is_active?: boolean;
      payment_note?: string | null;
    }) => updateSubscription(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminSubscriptionsQueryKey,
      });
    },
  });
}
