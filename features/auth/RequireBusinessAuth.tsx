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
  const { data: user, error, isLoading, isFetching, isError } = useMe();

  useEffect(() => {
    if (isLoading || isFetching) {
      return;
    }

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
  }, [user, error, isLoading, isFetching, isError, router, pathname]);

  if (isLoading || isFetching) {
    return <Spinner label="Duke kontrolluar hyrjen" />;
  }

  if (!requireBusinessUser(user)) {
    return <Spinner label="Duke ridrejtuar" />;
  }

  return children;
}
