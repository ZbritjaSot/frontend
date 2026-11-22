"use client";

import { AccountTreeOutlinedIcon, AddOutlinedIcon, CategoryIcon, CollectionsOutlinedIcon, DashboardIcon, HistoryOutlinedIcon, HomeOutlinedIcon, MailOutlinedIcon, PaymentsIcon, PendingActionsIcon, PersonOutlinedIcon, StoreIcon } from "@/components/ui/icons";
import type { ReactNode } from "react";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/chrome/DashboardShell";
import { latestExpiredSubscriptions } from "@/features/admin/expiredSubscriptions";
import { usePendingOffers } from "@/hooks/useAdminOffers";
import { useMe } from "@/hooks/useAuth";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";

const baseNav: DashboardNavItem[] = [
  {
    href: "/admin",
    label: "Paneli",
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    href: "/admin/offers",
    label: "Në pritje",
    icon: <PendingActionsIcon fontSize="small" />,
    group: "Moderimi",
  },
  {
    href: "/admin/audit",
    label: "Historiku",
    icon: <HistoryOutlinedIcon fontSize="small" />,
    group: "Moderimi",
  },
  {
    href: "/admin/businesses",
    label: "Bizneset",
    icon: <StoreIcon fontSize="small" />,
    group: "Katalogu",
  },
  {
    href: "/admin/categories",
    label: "Kategoritë",
    icon: <CategoryIcon fontSize="small" />,
    group: "Katalogu",
  },
  {
    href: "/admin/gallery",
    label: "Galeria",
    icon: <CollectionsOutlinedIcon fontSize="small" />,
    group: "Katalogu",
  },
  {
    href: "/admin/create",
    label: "Shto përmbajtje",
    icon: <AddOutlinedIcon fontSize="small" />,
    group: "Katalogu",
  },
  {
    href: "/admin/home",
    label: "Kryefaqja",
    icon: <HomeOutlinedIcon fontSize="small" />,
    group: "Rritja",
  },
  {
    href: "/admin/newsletter",
    label: "Buletini",
    icon: <MailOutlinedIcon fontSize="small" />,
    group: "Rritja",
  },
  {
    href: "/admin/subscriptions",
    label: "Abonimet",
    icon: <PaymentsIcon fontSize="small" />,
    group: "Rritja",
  },
  {
    href: "/admin/managers",
    label: "Menaxherët",
    icon: <AccountTreeOutlinedIcon fontSize="small" />,
    group: "Llogaria",
  },
  {
    href: "/admin/profile",
    label: "Profili",
    icon: <PersonOutlinedIcon fontSize="small" />,
    group: "Llogaria",
  },
];

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  const { data: user } = useMe();
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
    <DashboardShell
      area="admin"
      nav={nav}
      showLogout
      identity={
        user ? { name: user.name?.trim() || user.email, roleLabel: "Administrator" } : undefined
      }
    >
      {children}
    </DashboardShell>
  );
}
