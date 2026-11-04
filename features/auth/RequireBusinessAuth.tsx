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

type RequireBusinessAuthProps = {
  children: ReactNode;
};

export function RequireBusinessAuth({ children }: RequireBusinessAuthProps) {
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
      router.replace(loginHref(pathname || "/biz"));
      return;
    }

    if (!user) {
      return;
    }

    if (requireBusinessUser(user)) {
      return;
    }

    // Logged in as admin — send them to the admin panel.
    if (requireAdminUser(user)) {
      router.replace("/admin");
      return;
    }

    router.replace(loginHref());
  }, [user, error, isLoading, isError, router, pathname]);

  if (isLoading) {
    return <Spinner label="Duke kontrolluar hyrjen" />;
  }

  if (!requireBusinessUser(user)) {
    return <Spinner label="Duke ridrejtuar" />;
  }

  return children;
}
