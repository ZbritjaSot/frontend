"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveBusinessLocation,
  createBusiness,
  fetchAdminBusiness,
  fetchAdminBusinesses,
  fetchPendingBusinessLocations,
  rejectBusinessLocation,
  updateBusiness,
} from "@/features/admin/businessesApi";
import type { BusinessFormInput } from "@/schemas/business";

export const adminBusinessesQueryKey = ["admin", "businesses"] as const;

export function useAdminBusinesses(page: number, q = "") {
  return useQuery({
    queryKey: [...adminBusinessesQueryKey, page, q],
    queryFn: () => fetchAdminBusinesses(page, undefined, q),
    placeholderData: (previous) => previous,
  });
}

export function useAdminBusiness(id: string) {
  return useQuery({
    queryKey: [...adminBusinessesQueryKey, id],
    queryFn: () => fetchAdminBusiness(id),
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
      street?: string | null;
      village?: string | null;
      city?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      owner_name?: string;
      owner_email?: string;
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
