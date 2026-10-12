"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardKpi } from "@/components/ui/DashboardKpi";
import { Spinner } from "@/components/ui/Spinner";
import { fetchBizShops } from "@/features/branches/api";
import { ShopLogo } from "@/features/public/visuals";
import { validationMessage } from "@/lib/api";
import { btnGhost, btnPrimary, pageTitle, panelLead } from "@/lib/ui";
import type { CompanyShop } from "@/types";

function placeLine(shop: CompanyShop): string {
  const parts = [shop.street, shop.village, shop.city].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(", ");
  }
  return shop.address?.trim() || "Pa adresë";
}

function LocationRow({
  shop,
  showSubscription,
}: {
  shop: CompanyShop;
  showSubscription: boolean;
}) {
  const waiting = shop.pending_offers_count ?? 0;
  const active = shop.is_active !== false;

  return (
    <div className="flex items-center gap-3">
      <ShopLogo name={shop.name} logoUrl={shop.logo_url} size="md" />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate font-semibold">{shop.name}</p>
        <p className="m-0 mt-0.5 truncate text-sm text-muted">{placeLine(shop)}</p>
        <p className="m-0 mt-1 truncate text-sm text-muted">
          <span className={active ? "" : "font-semibold text-danger"}>
            {active ? "Aktive" : "Joaktive"}
          </span>
          {showSubscription ? (
            <>
              <span aria-hidden="true"> · </span>
              <span className={shop.subscribed ? "" : "font-semibold text-danger"}>
                {shop.subscribed ? "Abonimi aktiv" : "Pa abonim"}
              </span>
            </>
          ) : null}
          {waiting > 0 ? (
            <>
              <span aria-hidden="true"> · </span>
              <Link href="/biz" className="font-semibold text-ink no-underline hover:text-accent">
                {waiting} në pritje
              </Link>
            </>
          ) : null}
        </p>
      </div>
      <Link
        href={`/biznese/${shop.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-sm font-semibold text-muted no-underline hover:text-accent"
      >
        Faqja publike
      </Link>
    </div>
  );
}

export function ManagerShops() {
  const shops = useQuery({
    queryKey: ["biz", "shops"],
    queryFn: fetchBizShops,
  });

  if (shops.isLoading) {
    return <Spinner label="Duke ngarkuar dyqanet" />;
  }

  if (shops.isError) {
    return (
      <p className={panelLead}>
        {validationMessage(shops.error, "Nuk mundëm t’i ngarkojmë dyqanet.")}
      </p>
    );
  }

  const rows = shops.data ?? [];
  const mains = rows.filter((shop) => !shop.parent_id);
  const branchesOf = (main: CompanyShop) =>
    rows.filter((shop) => shop.parent_id === main.id);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${pageTitle} mb-0!`}>Dyqanet</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/biz/review/new" className={btnPrimary}>
            Fletushkë e re
          </Link>
          <Link href="/biz/review/new?kind=offers" className={btnGhost}>
            Oferta të reja
          </Link>
        </div>
      </div>
      <p className={`${panelLead} max-w-2xl`}>
        Kompanitë që ke në ngarkim, me logon, adresën dhe degët. Emailin dhe
        fjalëkalimin e dyqanit i ndryshon vetëm administrata.
      </p>
      <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 border-b border-line pb-5">
        <DashboardKpi label="Biznese" value={mains.length} detail="Kompani në ngarkim" />
        <DashboardKpi label="Degë" value={rows.filter((shop) => shop.parent_id).length} detail="Lokacione shtesë" />
        <DashboardKpi href="/biz" label="Në pritje" value={rows.reduce((sum, shop) => sum + (shop.pending_offers_count ?? 0), 0)} detail="Fletushka që presin" tone="pending" />
      </div>
      {mains.length === 0 ? (
        <p className={`${panelLead} mt-6`}>Nuk ke dyqan të caktuar.</p>
      ) : (
        <ul className="m-0 mt-6 grid list-none gap-4 p-0">
          {mains.map((main) => {
            const branches = branchesOf(main);
            return (
              <li
                key={main.id}
                className="overflow-hidden rounded-2xl border border-line bg-elevated"
              >
                <div className="p-4 sm:p-5">
                  <LocationRow shop={main} showSubscription />
                </div>
                {branches.length > 0 ? (
                  <ul className="m-0 list-none border-t border-line p-0">
                    {branches.map((branch) => (
                      <li key={branch.id} className="border-t border-line px-4 py-3 first:border-t-0 sm:px-5">
                        <LocationRow shop={branch} showSubscription={false} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
