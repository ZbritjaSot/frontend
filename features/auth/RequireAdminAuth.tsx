"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isUnauthenticated,
  requireAdminUser,
  requireBusinessUser,
  useMe,
} from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import { loginHref } from "@/lib/loginPath";

type RequireAdminAuthProps = {
  children: ReactNode;
};

export function RequireAdminAuth({ children }: RequireAdminAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, error, isLoading, isError } = useMe();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Only act on a genuine query failure (e.g. a background refetch that
    // comes back 401), not on `isFetching` — that flag is also true for
    // routine background revalidation while cached data is still valid and
    // being shown, and redirecting then would tear down the whole dashboard
    // shell (and any in-progress form state) for no reason.
    if (isUnauthenticated(error) || (isError && !user)) {
      router.replace(loginHref(pathname || "/admin"));
      return;
    }

    if (!user) {
      return;
    }

    if (requireAdminUser(user)) {
      return;
    }

    // Logged in as business (or other) — send them to their panel.
    if (requireBusinessUser(user)) {
      router.replace("/biz");
      return;
    }

    router.replace(loginHref());
  }, [user, error, isLoading, isError, router, pathname]);

  if (isLoading) {
    return <Spinner label="Duke kontrolluar hyrjen" />;
  }

  if (!requireAdminUser(user)) {
    return <Spinner label="Duke ridrejtuar" />;
  }

  return children;
}
