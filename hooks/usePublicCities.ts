"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPublicCities } from "@/features/offers/api";

export const publicCitiesQueryKey = ["cities"] as const;

/**
 * Active city names from the admin-managed list. The catalogue filters and every
 * business address field read this same list.
 */
export function usePublicCities() {
  return useQuery({
    queryKey: publicCitiesQueryKey,
    queryFn: () => fetchPublicCities(),
    staleTime: 5 * 60 * 1000,
  });
}
