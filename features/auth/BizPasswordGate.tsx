"use client";

import type { ReactNode } from "react";
import { ChangePasswordScreen } from "@/features/auth/ChangePasswordScreen";
import { useMe } from "@/hooks/useAuth";

export function BizPasswordGate({ children }: { children: ReactNode }) {
  const { data: user } = useMe();

  if (user?.must_change_password) {
    return <ChangePasswordScreen />;
  }

  return children;
}
