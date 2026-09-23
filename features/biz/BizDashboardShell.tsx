"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StoreIcon from "@mui/icons-material/Store";
import type { ReactNode } from "react";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/chrome/DashboardShell";
import { useRejectedOfferCount } from "@/hooks/useBizOffers";

const baseNav: DashboardNavItem[] = [
  { href: "/biz", label: "Paneli", icon: <DashboardIcon fontSize="small" /> },
  {
    href: "/biz/offers",
    label: "Ofertat",
    icon: <LocalOfferIcon fontSize="small" />,
  },
  { href: "/biz/profile", label: "Profili", icon: <StoreIcon fontSize="small" /> },
];

export function BizDashboardShell({ children }: { children: ReactNode }) {
  const { data: rejectedCount = 0 } = useRejectedOfferCount();

  const nav = baseNav.map((item) => {
    if (item.href === "/biz/offers") {
      return {
        ...item,
        badge: rejectedCount,
        badgeTone: "danger" as const,
        badgeLabel: `${rejectedCount} të refuzuara`,
      };
    }
    return item;
  });

  return (
    <DashboardShell area="biz" nav={nav} showLogout>
      {children}
    </DashboardShell>
  );
}
