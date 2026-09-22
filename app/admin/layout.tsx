import type { ReactNode } from "react";
import { DashboardShell } from "@/components/chrome/DashboardShell";

const nav = [
  { href: "/admin", label: "Paneli" },
  { href: "/admin/offers", label: "Ofertat në pritje" },
  { href: "/admin/businesses", label: "Bizneset" },
  { href: "/admin/categories", label: "Kategoritë" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell area="admin" nav={nav}>
      {children}
    </DashboardShell>
  );
}
