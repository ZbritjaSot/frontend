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

type RequireAdminAuthProps = {
  children: ReactNode;
};

export function RequireAdminAuth({ children }: RequireAdminAuthProps) {
  const router = useRouter();
  const { data: user, error, isLoading, isFetching, isError } = useMe();

  useEffect(() => {
    if (isLoading || isFetching) {
      return;
    }

    if (isUnauthenticated(error) || (isError && !user)) {
      router.replace("/admin/login");
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

    router.replace("/admin/login");
  }, [user, error, isLoading, isFetching, isError, router]);

  if (isLoading || isFetching) {
    return <Spinner label="Duke kontrolluar hyrjen" />;
  }

  if (!requireAdminUser(user)) {
    return <Spinner label="Duke ridrejtuar" />;
  }

  return children;
}
