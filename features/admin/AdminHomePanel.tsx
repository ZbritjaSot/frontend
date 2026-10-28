"use client";

import Link from "next/link";
import { DashboardKpi } from "@/components/ui/DashboardKpi";
import { Spinner } from "@/components/ui/Spinner";
import { AdminPendingBranches } from "@/features/admin/AdminPendingBranches";
import { latestExpiredSubscriptions } from "@/features/admin/expiredSubscriptions";
import {
  usePendingBranches,
  usePendingBusinessLocations,
} from "@/hooks/useAdminBusinesses";
import { usePendingOffers } from "@/hooks/useAdminOffers";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { pageTitle, panelLead } from "@/lib/ui";

export function AdminHomePanel() {
  const pending = usePendingOffers(1);
  const addresses = usePendingBusinessLocations(1, 1);
  const branches = usePendingBranches(1, 1);
  const subscriptions = useAdminSubscriptions();

  if (
    pending.isLoading ||
    addresses.isLoading ||
    branches.isLoading ||
    subscriptions.isLoading
  ) {
    return (
      <div>
        <h1 className={pageTitle}>Paneli</h1>
        <Spinner label="Duke ngarkuar panelin" />
      </div>
    );
  }

  const pendingTotal = pending.data?.meta?.total ?? pending.data?.data?.length ?? 0;
  const addressTotal = addresses.data?.meta?.total ?? addresses.data?.data?.length ?? 0;
  const branchTotal = branches.data?.meta?.total ?? branches.data?.data?.length ?? 0;
  const expired = latestExpiredSubscriptions(subscriptions.data?.data ?? []);

  return (
    <div>
      <h1 className={`${pageTitle} mb-1!`}>Paneli</h1>
      <p className={`${panelLead} mb-6`}>Përmbledhje e gjendjes së ZbritjaSot.</p>
      <p className="m-0 mb-2 text-xs font-bold tracking-[0.08em] text-muted uppercase">
        Kërkon vëmendje
      </p>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKpi
          href="/admin/offers"
          value={pendingTotal}
          label="Në pritje"
          detail="Fletushka nga dyqani ose menaxheri"
          tone={pendingTotal > 0 ? "pending" : "ink"}
        />
        <DashboardKpi
          href="/admin/businesses?scope=address"
          value={addressTotal}
          label="Adresa në pritje"
          detail="Ndryshime që presin vendim"
          tone={addressTotal > 0 ? "pending" : "ink"}
        />
        <DashboardKpi
          href="/admin/businesses?scope=branches"
          value={branchTotal}
          label="Degë në pritje"
          detail="Lokacione të reja"
          tone={branchTotal > 0 ? "pending" : "ink"}
        />
        <DashboardKpi
          href="/admin/subscriptions"
          value={expired.length}
          label="Abonime të skaduara"
          detail="Dyqane pa periudhë aktive"
          tone={expired.length > 0 ? "danger" : "ink"}
        />
      </div>
      <AdminPendingBranches />
      <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
        <Link href="/admin/businesses" className="text-muted no-underline hover:text-ink">
          Bizneset
        </Link>
        <Link href="/admin/categories" className="text-muted no-underline hover:text-ink">
          Kategoritë
        </Link>
        <Link href="/admin/home" className="text-muted no-underline hover:text-ink">
          Kryefaqja
        </Link>
        <Link href="/admin/managers" className="text-muted no-underline hover:text-ink">
          Menaxherët
        </Link>
      </nav>
    </div>
  );
}
