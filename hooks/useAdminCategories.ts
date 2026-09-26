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

export function useAdminCategories(page: number, q = "") {
  return useQuery({
    queryKey: [...adminCategoriesQueryKey, page, q],
    queryFn: () => fetchAdminCategories(page, undefined, q),
    placeholderData: (previous) => previous,
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

export function useReorderCategories(page: number) {
  const queryClient = useQueryClient();
  const queryKey = [...adminCategoriesQueryKey, page];
  return useMutation({
    mutationFn: (ids: string[]) => reorderCategories(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: adminCategoriesQueryKey });
      const previous = queryClient.getQueryData<Paginated<Category>>(queryKey);
      if (previous) {
        const byId = new Map(previous.data.map((category) => [category.id, category]));
        const orders = previous.data
          .map((category) => category.sort_order)
          .sort((left, right) => left - right);
        queryClient.setQueryData<Paginated<Category>>(queryKey, {
          ...previous,
          data: ids.flatMap((id, index) => {
            const category = byId.get(id);
            const sortOrder = orders[index];
            return category && sortOrder !== undefined
              ? [{ ...category, sort_order: sortOrder }]
              : [];
          }),
        });
      }
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
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
