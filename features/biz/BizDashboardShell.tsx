"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
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
    href: "/biz/flyers",
    label: "Fletushkat",
    icon: <DescriptionOutlinedIcon fontSize="small" />,
  },
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
    href: "/biz/flyers",
    label: "Fletushkat",
    icon: <DescriptionOutlinedIcon fontSize="small" />,
  },
  {
    href: "/biz/offers",
    label: "Ofertat",
    icon: <LocalOfferIcon fontSize="small" />,
  },
  {
    href: "/biz/shops",
    label: "Dyqanet",
    icon: <StoreIcon fontSize="small" />,
  },
  {
    href: "/biz/profile",
    label: "Profili",
    icon: <PersonOutlinedIcon fontSize="small" />,
  },
];

export function BizDashboardShell({ children }: { children: ReactNode }) {
  const { data: user } = useMe();
  const manager = !!user && hasRole(user, "manager");
  const { data: pendingFlyers = 0 } = usePendingOfferCount(!manager, "flyers");
  const { data: pendingOffers = 0 } = usePendingOfferCount(!manager, "offers");
  const review = useManagerReview(1, manager);
  const reviewFlyers = useManagerReview(1, manager, "pending", "", "flyers");
  const reviewOffers = useManagerReview(1, manager, "pending", "", "offers");

  if (manager) {
    const waiting = review.data?.meta?.total ?? review.data?.data.length ?? 0;
    const flyerWaiting =
      reviewFlyers.data?.meta?.total ?? reviewFlyers.data?.data.length ?? 0;
    const offerWaiting =
      reviewOffers.data?.meta?.total ?? reviewOffers.data?.data.length ?? 0;
    const nav = managerNav.map((item) => {
      if (item.href === "/biz") {
        return {
          ...item,
          badge: waiting,
          badgeTone: "pending" as const,
          badgeLabel: `${waiting} në pritje`,
        };
      }
      if (item.href === "/biz/flyers") {
        return {
          ...item,
          badge: flyerWaiting,
          badgeTone: "pending" as const,
        };
      }
      if (item.href === "/biz/offers") {
        return {
          ...item,
          badge: offerWaiting,
          badgeTone: "pending" as const,
        };
      }
      return item;
    });

    return (
      <DashboardShell area="biz" label="Menaxher" nav={nav} showLogout>
        {children}
      </DashboardShell>
    );
  }

  const nav = shopNav.map((item) => {
    if (item.href === "/biz/flyers") {
      return {
        ...item,
        badge: pendingFlyers,
        badgeTone: "pending" as const,
        badgeLabel: `${pendingFlyers} në pritje`,
      };
    }
    if (item.href === "/biz/offers") {
      return {
        ...item,
        badge: pendingOffers,
        badgeTone: "pending" as const,
        badgeLabel: `${pendingOffers} në pritje`,
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
