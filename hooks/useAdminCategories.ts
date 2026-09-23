"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  reorderCategories,
  updateCategory,
} from "@/features/admin/categoriesApi";
import type { CategoryFormInput } from "@/schemas/category";
import type { Category, Paginated } from "@/types";

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

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderCategories(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: adminCategoriesQueryKey });
      const previous = queryClient.getQueryData<Paginated<Category>>(
        adminCategoriesQueryKey,
      );
      if (previous) {
        const byId = new Map(previous.data.map((category) => [category.id, category]));
        queryClient.setQueryData<Paginated<Category>>(adminCategoriesQueryKey, {
          ...previous,
          data: ids.flatMap((id, index) => {
            const category = byId.get(id);
            return category ? [{ ...category, sort_order: index }] : [];
          }),
        });
      }
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(adminCategoriesQueryKey, context.previous);
      }
    },
    onSettled: async () => {
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
