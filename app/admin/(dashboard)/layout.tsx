import type { ReactNode } from "react";
import { RequireAdminAuth } from "@/features/auth/RequireAdminAuth";
import { AdminDashboardShell } from "@/features/admin/AdminDashboardShell";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireAdminAuth>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </RequireAdminAuth>
  );
}
