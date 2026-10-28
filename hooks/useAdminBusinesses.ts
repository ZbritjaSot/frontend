"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveBusinessLocation,
  createBusiness,
  fetchAdminBusiness,
  fetchAdminBusinesses,
  fetchPendingBranches,
  fetchPendingBusinessLocations,
  rejectBusinessLocation,
  updateBusiness,
} from "@/features/admin/businessesApi";
import { approveAdminBranch } from "@/features/branches/api";
import type { BusinessFormInput } from "@/schemas/business";

export const adminBusinessesQueryKey = ["admin", "businesses"] as const;

export function useAdminBusinesses(page: number, q = "", scope = "") {
  return useQuery({
    queryKey: [...adminBusinessesQueryKey, page, q, scope],
    queryFn: () => fetchAdminBusinesses(page, undefined, q, scope),
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

export function usePendingBranches(page = 1, perPage = 8) {
  return useQuery({
    queryKey: [...adminBusinessesQueryKey, "pending-branches", page, perPage],
    queryFn: () => fetchPendingBranches(page, perPage),
    placeholderData: (previous) => previous,
  });
}

export function useApproveBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveAdminBranch(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminBusinessesQueryKey,
      });
    },
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
      extra_placement?: boolean;
      street?: string | null;
      neighborhood?: string | null;
      village?: string | null;
      municipality?: string | null;
      city?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      owner_name?: string;
      owner_email?: string;
      website_url?: string | null;
      instagram_url?: string | null;
      facebook_url?: string | null;
      whatsapp?: string | null;
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
