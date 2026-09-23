import type { ReactNode } from "react";
import { BizPasswordGate } from "@/features/auth/BizPasswordGate";
import { RequireBusinessAuth } from "@/features/auth/RequireBusinessAuth";
import { BizDashboardShell } from "@/features/biz/BizDashboardShell";

export default function BizDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireBusinessAuth>
      <BizPasswordGate>
        <BizDashboardShell>{children}</BizDashboardShell>
      </BizPasswordGate>
    </RequireBusinessAuth>
  );
}
