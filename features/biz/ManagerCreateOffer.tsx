"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { Spinner } from "@/components/ui/Spinner";
import { fetchBizShops } from "@/features/branches/api";
import { OfferForm } from "@/features/offers/OfferForm";
import { validationMessage } from "@/lib/api";
import { pageTitle, panelLead } from "@/lib/ui";

export function ManagerCreateOffer() {
  const shops = useQuery({
    queryKey: ["biz", "shops"],
    queryFn: fetchBizShops,
  });
  const [shopId, setShopId] = useState("");

  const rows = shops.data ?? [];
  const selected = rows.find((shop) => shop.id === shopId);

  return (
    <div>
      <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
        <Link
          href="/biz"
          className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Në pritje</span>
        </Link>
        <h1 className={`${pageTitle} col-start-2 mt-3 mb-0!`}>Dosje e re</h1>
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
                  label: [
                    shop.name,
                    shop.city,
                    shop.parent_id ? "degë" : null,
                  ]
                    .filter(Boolean)
                    .join(" · "),
                }))}
              />
            </label>
            <p className="m-0 mt-3 text-sm leading-relaxed text-muted">
              Shkruaj produktet siç të vijnë nga dyqani. Pas ruajtjes fletushka
              del te lista në pritje, ku mund ta aprovosh.
            </p>
          </section>
          {selected ? (
            <OfferForm
              key={selected.id}
              mode="create"
              audience="manager"
              businessId={selected.id}
              canShare={!selected.parent_id}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
