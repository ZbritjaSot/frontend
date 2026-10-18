"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { Spinner } from "@/components/ui/Spinner";
import type { BundleCatalog } from "@/features/offers/bizApi";
import { OfferForm } from "@/features/offers/OfferForm";
import { useActiveStores } from "@/hooks/useAdminOffers";
import { validationMessage } from "@/lib/api";
import { pageTitle, panelLead } from "@/lib/ui";

export function AdminCreateBundle({
  catalog,
  businessId,
}: {
  catalog: BundleCatalog;
  businessId: string;
}) {
  const stores = useActiveStores();
  const [shopId, setShopId] = useState(businessId);
  const isFlyer = catalog === "flyers";
  const section = isFlyer ? "fletushkat" : "ofertat";
  const backHref = `/admin/businesses/${businessId}?section=${section}`;
  const rows = stores.data ?? [];
  const selected = rows.find((shop) => shop.id === shopId) ?? null;

  return (
    <div>
      <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
        <Link
          href={backHref}
          className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
        >
          <ArrowBackIcon fontSize="small" />
          <span>{isFlyer ? "Fletushkat" : "Ofertat"}</span>
        </Link>
        <h1 className={`${pageTitle} col-start-2 mt-3 mb-0!`}>
          {isFlyer ? "Fletushkë e re" : "Oferta të reja"}
        </h1>
      </div>

      {stores.isLoading ? (
        <Spinner label="Duke ngarkuar dyqanet" />
      ) : stores.isError ? (
        <p className={panelLead}>
          {validationMessage(stores.error, "Nuk mundëm t’i ngarkojmë dyqanet.")}
        </p>
      ) : rows.length === 0 ? (
        <p className={panelLead}>Nuk ka dyqan aktiv me abonim të vlefshëm.</p>
      ) : (
        <div className="grid gap-8">
          <section className="rounded-2xl border border-line px-5 py-5">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
                Dyqani
              </span>
              <SelectField
                value={rows.some((shop) => shop.id === shopId) ? shopId : ""}
                onChange={setShopId}
                searchable
                placeholder="Zgjidh dyqanin aktiv"
                aria-label="Dyqani"
                options={rows.map((shop) => ({
                  value: shop.id,
                  label: shop.city ? `${shop.name} · ${shop.city}` : shop.name,
                }))}
              />
            </label>
            <p className="m-0 mt-3 text-sm leading-relaxed text-muted">
              {isFlyer
                ? "Shkruaj produktet e fletushkës. Ruhet e aprovuar menjëherë për dyqanin aktiv që zgjedh."
                : "Shto një ose më shumë oferta individuale. Ruhen të aprovuara menjëherë për dyqanin aktiv që zgjedh."}
            </p>
          </section>
          {selected ? (
            <OfferForm
              key={`${selected.id}-${catalog}`}
              mode="create"
              audience="admin"
              businessId={selected.id}
              canShare={selected.parent_id === null}
              catalog={catalog}
              doneHref={
                selected.id === businessId
                  ? backHref
                  : `/admin/businesses/${selected.id}?section=${section}`
              }
            />
          ) : (
            <p className={panelLead}>
              Ky dyqan nuk është aktiv. Zgjidh një dyqan me abonim të vlefshëm.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
