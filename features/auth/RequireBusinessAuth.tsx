"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
  const { data: user, error, isLoading, isFetching, isError } = useMe();

  useEffect(() => {
    if (isLoading || isFetching) {
      return;
    }

    if (isUnauthenticated(error) || (isError && !user)) {
      router.replace("/biz/login");
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
  }, [user, error, isLoading, isFetching, isError, router]);

  if (isLoading || isFetching) {
    return <Spinner label="Duke kontrolluar hyrjen" />;
  }

  if (!requireBusinessUser(user)) {
    return <Spinner label="Duke ridrejtuar" />;
  }

  return children;
}
