"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  isUnauthenticated,
  requireBusinessUser,
  useMe,
} from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

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
    return <Spinner label="Duke kontrolluar hyrjen" />;
  }

  if (!requireBusinessUser(user)) {
    return <Spinner label="Duke ridrejtuar" />;
  }

  return children;
}
