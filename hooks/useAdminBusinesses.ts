"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveBusinessLocation,
  createBusiness,
  fetchAdminBusinesses,
  fetchPendingBusinessLocations,
  rejectBusinessLocation,
  updateBusiness,
} from "@/features/admin/businessesApi";
import type { BusinessFormInput } from "@/schemas/business";

export const adminBusinessesQueryKey = ["admin", "businesses"] as const;

export function useAdminBusinesses(page: number) {
  return useQuery({
    queryKey: [...adminBusinessesQueryKey, page],
    queryFn: () => fetchAdminBusinesses(page),
    placeholderData: (previous) => previous,
  });
}

export function usePendingBusinessLocations(page = 1, perPage = 4) {
  return useQuery({
    queryKey: [...adminBusinessesQueryKey, "pending-locations", page, perPage],
    queryFn: () => fetchPendingBusinessLocations(page, perPage),
    placeholderData: (previous) => previous,
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BusinessFormInput) => createBusiness(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminBusinessesQueryKey,
      });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      is_active?: boolean;
    }) => updateBusiness(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminBusinessesQueryKey,
      });
    },
  });
}

export function useApproveBusinessLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveBusinessLocation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminBusinessesQueryKey,
      });
    },
  });
}

export function useRejectBusinessLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      rejectBusinessLocation(id, note),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminBusinessesQueryKey,
      });
    },
  });
}
