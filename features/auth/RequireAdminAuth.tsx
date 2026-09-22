"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  isUnauthenticated,
  requireAdminUser,
  useMe,
} from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

type RequireAdminAuthProps = {
  children: ReactNode;
};

export function RequireAdminAuth({ children }: RequireAdminAuthProps) {
  const router = useRouter();
  const { data: user, error, isLoading, isFetching } = useMe();

  useEffect(() => {
    if (isLoading || isFetching) {
      return;
    }

    if (isUnauthenticated(error) || !user) {
      router.replace("/admin/login");
      return;
    }

    if (!requireAdminUser(user)) {
      router.replace("/admin/login");
    }
  }, [user, error, isLoading, isFetching, router]);

  if (isLoading || isFetching) {
    return <Spinner label="Duke kontrolluar hyrjen" />;
  }

  if (!requireAdminUser(user)) {
    return <Spinner label="Duke ridrejtuar" />;
  }

  return children;
}
