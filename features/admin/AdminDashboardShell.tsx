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
import { usePendingOffers } from "@/hooks/useAdminOffers";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import type { Subscription } from "@/types";

const baseNav: DashboardNavItem[] = [
  { href: "/admin", label: "Paneli", icon: <DashboardIcon fontSize="small" /> },
  {
    href: "/admin/offers",
    label: "Ofertat në pritje",
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

function isLatestExpired(sub: Subscription): boolean {
  return (
    sub.is_active &&
    !sub.is_current &&
    new Date(sub.ends_at).getTime() <= Date.now()
  );
}

/** Businesses whose newest subscription has expired. */
function countExpiredBusinesses(subscriptions: Subscription[]): number {
  const latest = new Map<string, Subscription>();

  for (const sub of subscriptions) {
    const current = latest.get(sub.business_id);
    const subTime = new Date(sub.created_at ?? sub.starts_at).getTime();
    const currentTime = current
      ? new Date(current.created_at ?? current.starts_at).getTime()
      : Number.NEGATIVE_INFINITY;
    if (!current || subTime >= currentTime) {
      latest.set(sub.business_id, sub);
    }
  }

  let count = 0;
  for (const sub of latest.values()) {
    if (isLatestExpired(sub)) {
      count += 1;
    }
  }
  return count;
}

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  const { data } = usePendingOffers();
  const { data: subscriptions } = useAdminSubscriptions();
  const pendingCount = data?.meta?.total ?? data?.data?.length ?? 0;
  const expiredCount = countExpiredBusinesses(subscriptions?.data ?? []);

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
