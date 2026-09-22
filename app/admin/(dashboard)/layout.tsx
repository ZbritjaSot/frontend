import type { ReactNode } from "react";
import { DashboardShell } from "@/components/chrome/DashboardShell";
import { RequireAdminAuth } from "@/features/auth/RequireAdminAuth";

const nav = [
  { href: "/admin", label: "Paneli" },
  { href: "/admin/offers", label: "Ofertat në pritje" },
  { href: "/admin/businesses", label: "Bizneset" },
  { href: "/admin/categories", label: "Kategoritë" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireAdminAuth>
      <DashboardShell area="admin" nav={nav} showLogout>
        {children}
      </DashboardShell>
    </RequireAdminAuth>
  );
}
