"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  updateCategory,
} from "@/features/admin/categoriesApi";
import type { CategoryFormInput } from "@/schemas/category";

export const adminCategoriesQueryKey = ["admin", "categories"] as const;

export function useAdminCategories() {
  return useQuery({
    queryKey: adminCategoriesQueryKey,
    queryFn: () => fetchAdminCategories(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryFormInput) => createCategory(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminCategoriesQueryKey,
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: { id: string } & Partial<CategoryFormInput>) =>
      updateCategory(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminCategoriesQueryKey,
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminCategoriesQueryKey,
      });
    },
  });
}
