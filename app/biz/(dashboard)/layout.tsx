import type { ReactNode } from "react";
import { DashboardShell } from "@/components/chrome/DashboardShell";
import { RequireBusinessAuth } from "@/features/auth/RequireBusinessAuth";

const nav = [
  { href: "/biz", label: "Paneli" },
  { href: "/biz/offers", label: "Ofertat e mia" },
  { href: "/biz/profile", label: "Profili" },
];

export default function BizDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireBusinessAuth>
      <DashboardShell area="biz" nav={nav} showLogout>
        {children}
      </DashboardShell>
    </RequireBusinessAuth>
  );
}
