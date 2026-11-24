"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCity,
  deleteCity,
  fetchAdminCities,
  reorderCities,
  updateCity,
} from "@/features/admin/citiesApi";
import { publicCitiesQueryKey } from "@/hooks/usePublicCities";
import type { CityFormInput } from "@/schemas/city";
import type { City, Paginated } from "@/types";

export const adminCitiesQueryKey = ["admin", "cities"] as const;

export function useAdminCities(page: number, q = "") {
  return useQuery({
    queryKey: [...adminCitiesQueryKey, page, q],
    queryFn: () => fetchAdminCities(page, undefined, q),
    placeholderData: (previous) => previous,
  });
}

/** Any change here also changes the pickers and filters everywhere else. */
function useInvalidateCities() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminCitiesQueryKey }),
      queryClient.invalidateQueries({ queryKey: publicCitiesQueryKey }),
    ]);
  };
}

export function useCreateCity() {
  const invalidate = useInvalidateCities();
  return useMutation({ mutationFn: (input: CityFormInput) => createCity(input), onSuccess: invalidate });
}

export function useUpdateCity() {
  const invalidate = useInvalidateCities();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<CityFormInput>) => updateCity(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCity() {
  const invalidate = useInvalidateCities();
  return useMutation({ mutationFn: (id: string) => deleteCity(id), onSuccess: invalidate });
}

export function useReorderCities(page: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateCities();
  const queryKey = [...adminCitiesQueryKey, page];
  return useMutation({
    mutationFn: (ids: string[]) => reorderCities(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: adminCitiesQueryKey });
      const previous = queryClient.getQueryData<Paginated<City>>(queryKey);
      if (previous) {
        const byId = new Map(previous.data.map((city) => [city.id, city]));
        const orders = previous.data.map((city) => city.sort_order).sort((a, b) => a - b);
        queryClient.setQueryData<Paginated<City>>(queryKey, {
          ...previous,
          data: ids.flatMap((id, index) => {
            const city = byId.get(id);
            const sortOrder = orders[index];
            return city && sortOrder !== undefined ? [{ ...city, sort_order: sortOrder }] : [];
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
    onSettled: invalidate,
  });
}
