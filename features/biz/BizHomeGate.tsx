"use client";

import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { BizHomePanel } from "@/features/biz/BizHomePanel";
import { ManagerReview } from "@/features/biz/ManagerReview";
import { hasRole } from "@/features/auth/api";
import { useMe } from "@/hooks/useAuth";

export function BizHomeGate() {
  const { data: user } = useMe();

  if (user && hasRole(user, "manager")) {
    return (
      <Suspense fallback={<Spinner label="Duke ngarkuar listën" />}>
        <ManagerReview />
      </Suspense>
    );
  }

  return <BizHomePanel />;
}
