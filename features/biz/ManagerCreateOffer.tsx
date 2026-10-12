"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { Spinner } from "@/components/ui/Spinner";
import { fetchBizShops } from "@/features/branches/api";
import type { BundleCatalog } from "@/features/offers/bizApi";
import { OfferForm } from "@/features/offers/OfferForm";
import { validationMessage } from "@/lib/api";
import { pageTitle, panelLead } from "@/lib/ui";

export function ManagerCreateOffer({
  catalog = "flyers",
}: {
  catalog?: BundleCatalog;
}) {
  const shops = useQuery({
    queryKey: ["biz", "shops"],
    queryFn: fetchBizShops,
  });
  const [shopId, setShopId] = useState("");

  const rows = (shops.data ?? []).filter((shop) => !shop.parent_id);
  const selected = rows.find((shop) => shop.id === shopId);
  const isFlyer = catalog === "flyers";
  const backHref = isFlyer ? "/biz/flyers" : "/biz/offers";

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

      {shops.isLoading ? (
        <Spinner label="Duke ngarkuar dyqanet" />
      ) : shops.isError ? (
        <p className={panelLead}>
          {validationMessage(shops.error, "Nuk mundëm t’i ngarkojmë dyqanet.")}
        </p>
      ) : rows.length === 0 ? (
        <p className={panelLead}>Nuk ke dyqan të caktuar.</p>
      ) : (
        <div className="grid gap-8">
          <section className="rounded-2xl border border-line px-5 py-5">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
                Dyqani
              </span>
              <SelectField
                value={shopId}
                onChange={setShopId}
                searchable
                placeholder="Zgjidh dyqanin"
                aria-label="Dyqani"
                options={rows.map((shop) => ({
                  value: shop.id,
                  label: shop.name,
                }))}
              />
            </label>
            <p className="m-0 mt-3 text-sm leading-relaxed text-muted">
              {isFlyer
                ? "Shkruaj produktet e fletushkës. Pas ruajtjes del te lista në pritje."
                : "Shto një ose më shumë oferta individuale. Pas ruajtjes dalin te lista në pritje."}
            </p>
          </section>
          {selected ? (
            <OfferForm
              key={`${selected.id}-${catalog}`}
              mode="create"
              audience="manager"
              businessId={selected.id}
              canShare
              catalog={catalog}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
