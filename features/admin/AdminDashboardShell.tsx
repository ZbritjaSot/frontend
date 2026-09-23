"use client";

import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PaymentsIcon from "@mui/icons-material/Payments";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import StoreIcon from "@mui/icons-material/Store";
import type { ReactNode } from "react";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/chrome/DashboardShell";
import { latestExpiredSubscriptions } from "@/features/admin/expiredSubscriptions";
import { usePendingOffers } from "@/hooks/useAdminOffers";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";

const baseNav: DashboardNavItem[] = [
  { href: "/admin", label: "Paneli", icon: <DashboardIcon fontSize="small" /> },
  {
    href: "/admin/offers",
    label: "Në pritje",
    icon: <PendingActionsIcon fontSize="small" />,
  },
  {
    href: "/admin/subscriptions",
    label: "Abonimet",
    icon: <PaymentsIcon fontSize="small" />,
  },
  {
    href: "/admin/businesses",
    label: "Bizneset",
    icon: <StoreIcon fontSize="small" />,
  },
  {
    href: "/admin/categories",
    label: "Kategoritë",
    icon: <CategoryIcon fontSize="small" />,
  },
];

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  const { data } = usePendingOffers();
  const { data: subscriptions } = useAdminSubscriptions();
  const pendingCount = data?.meta?.total ?? data?.data?.length ?? 0;
  const expiredCount = latestExpiredSubscriptions(subscriptions?.data ?? []).length;

  const nav = baseNav.map((item) => {
    if (item.href === "/admin/offers") {
      return { ...item, badge: pendingCount, badgeTone: "pending" as const };
    }
    if (item.href === "/admin/subscriptions") {
      return { ...item, badge: expiredCount, badgeTone: "danger" as const };
    }
    return item;
  });

  return (
    <DashboardShell area="admin" nav={nav} showLogout>
      {children}
    </DashboardShell>
  );
}
