import type { ReactNode } from "react";
import { DashboardShell } from "@/components/chrome/DashboardShell";

const nav = [
  { href: "/biz", label: "Paneli" },
  { href: "/biz/offers", label: "Ofertat e mia" },
  { href: "/biz/profile", label: "Profili" },
];

export default function BizLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell area="biz" nav={nav}>
      {children}
    </DashboardShell>
  );
}
