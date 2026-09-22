"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  isUnauthenticated,
  requireBusinessUser,
  useMe,
} from "@/hooks/useAuth";

type RequireBusinessAuthProps = {
  children: ReactNode;
};

export function RequireBusinessAuth({ children }: RequireBusinessAuthProps) {
  const router = useRouter();
  const { data: user, error, isLoading, isFetching } = useMe();

  useEffect(() => {
    if (isLoading || isFetching) {
      return;
    }

    if (isUnauthenticated(error) || !user) {
      router.replace("/biz/login");
      return;
    }

    if (!requireBusinessUser(user)) {
      router.replace("/biz/login");
    }
  }, [user, error, isLoading, isFetching, router]);

  if (isLoading || isFetching) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">Duke kontrolluar hyrjen…</p>
      </div>
    );
  }

  if (!requireBusinessUser(user)) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">Duke ridrejtuar te hyrja…</p>
      </div>
    );
  }

  return children;
}
