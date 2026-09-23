"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBusiness,
  fetchAdminBusinesses,
  updateBusiness,
} from "@/features/admin/businessesApi";
import type { BusinessFormInput } from "@/schemas/business";

export const adminBusinessesQueryKey = ["admin", "businesses"] as const;

export function useAdminBusinesses() {
  return useQuery({
    queryKey: adminBusinessesQueryKey,
    queryFn: () => fetchAdminBusinesses(),
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
