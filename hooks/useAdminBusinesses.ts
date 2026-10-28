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
import type { Business } from "@/types";

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

function withPriority(business: Business, id: string, isPriority: boolean): Business {
  if (business.id === id) {
    return { ...business, is_priority: isPriority };
  }
  if (!business.branches?.some((branch) => branch.id === id)) {
    return business;
  }
  return {
    ...business,
    branches: business.branches.map((branch) =>
      branch.id === id ? { ...branch, is_priority: isPriority } : branch,
    ),
  };
}

function patchPriorityCache(current: unknown, id: string, isPriority: boolean): unknown {
  if (!current || typeof current !== "object") {
    return current;
  }
  if ("data" in current && Array.isArray((current as { data: unknown }).data)) {
    const page = current as { data: Business[] };
    return {
      ...page,
      data: page.data.map((business) => withPriority(business, id, isPriority)),
    };
  }
  if ("id" in current) {
    return withPriority(current as Business, id, isPriority);
  }
  return current;
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
      is_priority?: boolean;
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
    onMutate: async (variables) => {
      if (typeof variables.is_priority !== "boolean") {
        return;
      }
      await queryClient.cancelQueries({ queryKey: adminBusinessesQueryKey });
      const previous = queryClient.getQueriesData({
        queryKey: adminBusinessesQueryKey,
      });
      queryClient.setQueriesData({ queryKey: adminBusinessesQueryKey }, (current) =>
        patchPriorityCache(current, variables.id, variables.is_priority === true),
      );
      return { previous };
    },
    onError: (_error, variables, context) => {
      if (typeof variables.is_priority !== "boolean" || !context?.previous) {
        return;
      }
      for (const [key, data] of context.previous) {
        queryClient.setQueryData(key, data);
      }
    },
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
