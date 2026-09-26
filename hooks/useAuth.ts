"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clearActingShopId } from "@/features/biz/actingShop";
import { fetchMe, hasRole, logout as logoutRequest } from "@/features/auth/api";
import { ApiError } from "@/lib/api";
import type { User } from "@/types";

export const meQueryKey = ["auth", "me"] as const;

export function useMe(enabled = true) {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: fetchMe,
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return async () => {
    try {
      await logoutRequest();
    } finally {
      clearActingShopId();
      queryClient.setQueryData(meQueryKey, null);
      await queryClient.invalidateQueries({ queryKey: meQueryKey });
    }
  };
}

export function isUnauthenticated(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 419);
}

export function requireBusinessUser(user: User | undefined): user is User {
  return !!user && (hasRole(user, "business") || hasRole(user, "manager"));
}

export function requireAdminUser(user: User | undefined): user is User {
  return !!user && hasRole(user, "admin");
}
