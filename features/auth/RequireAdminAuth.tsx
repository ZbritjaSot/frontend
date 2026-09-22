"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  isUnauthenticated,
  requireAdminUser,
  useMe,
} from "@/hooks/useAuth";

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
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">Duke kontrolluar hyrjen…</p>
      </div>
    );
  }

  if (!requireAdminUser(user)) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">Duke ridrejtuar te hyrja…</p>
      </div>
    );
  }

  return children;
}
