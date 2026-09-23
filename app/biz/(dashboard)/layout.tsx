import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StoreIcon from "@mui/icons-material/Store";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/chrome/DashboardShell";
import { BizPasswordGate } from "@/features/auth/BizPasswordGate";
import { RequireBusinessAuth } from "@/features/auth/RequireBusinessAuth";

const nav = [
  { href: "/biz", label: "Paneli", icon: <DashboardIcon fontSize="small" /> },
  {
    href: "/biz/offers",
    label: "Ofertat e mia",
    icon: <LocalOfferIcon fontSize="small" />,
  },
  { href: "/biz/profile", label: "Profili", icon: <StoreIcon fontSize="small" /> },
];

export default function BizDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireBusinessAuth>
      <DashboardShell area="biz" nav={nav} showLogout>
        <BizPasswordGate>{children}</BizPasswordGate>
      </DashboardShell>
    </RequireBusinessAuth>
  );
}
