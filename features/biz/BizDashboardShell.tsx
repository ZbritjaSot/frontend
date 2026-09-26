"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import StoreIcon from "@mui/icons-material/Store";
import type { ReactNode } from "react";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/chrome/DashboardShell";
import { hasRole } from "@/features/auth/api";
import { useMe } from "@/hooks/useAuth";
import { usePendingOfferCount } from "@/hooks/useBizOffers";
import { useManagerReview } from "@/hooks/useManagerReview";

const shopNav: DashboardNavItem[] = [
  { href: "/biz", label: "Paneli", icon: <DashboardIcon fontSize="small" /> },
  {
    href: "/biz/offers",
    label: "Ofertat",
    icon: <LocalOfferIcon fontSize="small" />,
  },
  { href: "/biz/profile", label: "Profili", icon: <StoreIcon fontSize="small" /> },
];

const managerNav: DashboardNavItem[] = [
  {
    href: "/biz",
    label: "Në pritje",
    icon: <PendingActionsIcon fontSize="small" />,
  },
  {
    href: "/biz/shops",
    label: "Dyqanet",
    icon: <StoreIcon fontSize="small" />,
  },
];

export function BizDashboardShell({ children }: { children: ReactNode }) {
  const { data: user } = useMe();
  const manager = !!user && hasRole(user, "manager");
  const { data: pendingCount = 0 } = usePendingOfferCount(!manager);
  const review = useManagerReview(1, manager);

  if (manager) {
    const waiting = review.data?.meta?.total ?? review.data?.data.length ?? 0;
    const nav = managerNav.map((item) =>
      item.href === "/biz"
        ? {
            ...item,
            badge: waiting,
            badgeTone: "pending" as const,
            badgeLabel: `${waiting} në pritje`,
          }
        : item,
    );

    return (
      <DashboardShell area="biz" label="Menaxher" nav={nav} showLogout>
        {children}
      </DashboardShell>
    );
  }

  const nav = shopNav.map((item) => {
    if (item.href === "/biz/offers") {
      return {
        ...item,
        badge: pendingCount,
        badgeTone: "pending" as const,
        badgeLabel: `${pendingCount} në pritje`,
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
