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
      const next = encodeURIComponent(pathname || "/biz");
      router.replace(`/biz/login?next=${next}`);
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

    router.replace("/biz/login");
  }, [user, error, isLoading, isFetching, isError, router, pathname]);

  if (isLoading || isFetching) {
    return <Spinner label="Duke kontrolluar hyrjen" />;
  }

  if (!requireBusinessUser(user)) {
    return <Spinner label="Duke ridrejtuar" />;
  }

  return children;
}
