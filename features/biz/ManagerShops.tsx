"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { fetchBizShops } from "@/features/branches/api";
import { ShopLogo } from "@/features/public/visuals";
import { validationMessage } from "@/lib/api";
import { btnGhost, btnPrimary, btnSm, offerStatusClass, pageTitle, panelLead } from "@/lib/ui";
import type { CompanyShop } from "@/types";

function placeLine(shop: CompanyShop): string {
  const parts = [shop.street, shop.village, shop.city].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(", ");
  }
  return shop.address?.trim() || "Pa adresë";
}

function ShopMarks({ shop }: { shop: CompanyShop }) {
  const waiting = shop.pending_offers_count ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={offerStatusClass(shop.is_active === false ? "rejected" : "approved")}>
        {shop.is_active === false ? "Joaktive" : "Aktive"}
      </span>
      <span className={offerStatusClass(shop.subscribed ? "approved" : "pending")}>
        {shop.subscribed ? "Abonimi aktiv" : "Pa abonim"}
      </span>
      {waiting > 0 ? (
        <Link href="/biz" className={`${offerStatusClass("pending")} no-underline`}>
          {waiting} në pritje
        </Link>
      ) : null}
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
      <h1 className={pageTitle}>Dyqanet</h1>
      <p className={`${panelLead} max-w-2xl`}>
        Kompanitë që ke në ngarkim, me logon, adresën dhe degët. Emailin dhe
        fjalëkalimin e dyqanit i ndryshon vetëm administrata.
      </p>
      {mains.length === 0 ? (
        <p className={`${panelLead} mt-6`}>Nuk ke dyqan të caktuar.</p>
      ) : (
        <ul className="m-0 mt-6 grid list-none gap-4 p-0">
          {mains.map((main) => {
            const branches = branchesOf(main);
            const locations = branches.length + 1;
            return (
              <li
                key={main.id}
                className="overflow-hidden rounded-2xl border border-line bg-elevated"
              >
                <div className="flex gap-4 p-4 sm:p-5">
                  <ShopLogo name={main.name} logoUrl={main.logo_url} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[0.68rem] font-bold tracking-[0.14em] text-muted uppercase">
                      Dyqani kryesor · {locations}{" "}
                      {locations === 1 ? "lokacion" : "lokacione"}
                    </p>
                    <h2 className="m-0 mt-1 truncate text-xl font-extrabold tracking-tight">
                      {main.name}
                    </h2>
                    <p className="m-0 mt-1 text-sm leading-relaxed text-muted">
                      {placeLine(main)}
                    </p>
                    <div className="mt-3">
                      <ShopMarks shop={main} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/biznese/${main.id}`}
                        className={`${btnGhost} ${btnSm}`}
                      >
                        Faqja publike
                      </Link>
                      <Link href="/biz/review/new" className={`${btnPrimary} ${btnSm}`}>
                        Dosje e re
                      </Link>
                    </div>
                  </div>
                </div>
                {branches.length > 0 ? (
                  <div className="border-t border-line bg-sunken/50 px-4 py-4 sm:px-5">
                    <p className="m-0 text-[0.68rem] font-bold tracking-[0.14em] text-muted uppercase">
                      Degët
                    </p>
                    <ul className="m-0 mt-3 grid list-none gap-2 p-0 sm:grid-cols-2">
                      {branches.map((branch) => (
                        <li
                          key={branch.id}
                          className="flex h-full items-start gap-3 rounded-xl border border-line bg-elevated p-3"
                        >
                          <ShopLogo
                            name={branch.name}
                            logoUrl={branch.logo_url}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/biznese/${branch.id}`}
                              className="block truncate font-semibold text-ink no-underline hover:text-accent"
                            >
                              {branch.name}
                            </Link>
                            <p className="m-0 mt-0.5 text-sm leading-relaxed text-muted">
                              {placeLine(branch)}
                            </p>
                            <div className="mt-2">
                              <ShopMarks shop={branch} />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
