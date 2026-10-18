"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { Spinner } from "@/components/ui/Spinner";
import { fetchAdminBusiness } from "@/features/admin/businessesApi";
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
  /** When set (business profile), preselect that company (main shop). */
  businessId?: string;
}) {
  const stores = useActiveStores();
  const profile = useQuery({
    queryKey: ["admin", "businesses", businessId],
    queryFn: () => fetchAdminBusiness(businessId!),
    enabled: Boolean(businessId),
  });
  const [shopOverride, setShopOverride] = useState<string | null>(null);
  const preferredShopId = profile.data
    ? (profile.data.parent_id ?? profile.data.id)
    : "";
  const isFlyer = catalog === "flyers";
  const section = isFlyer ? "fletushkat" : "ofertat";
  const fromProfile = Boolean(businessId);
  const backHref = fromProfile
    ? `/admin/businesses/${businessId}?section=${section}`
    : "/admin/create";
  const backLabel = fromProfile
    ? isFlyer
      ? "Fletushkat"
      : "Ofertat"
    : "Shto përmbajtje";
  const rows = stores.data ?? [];
  const shopId = shopOverride ?? preferredShopId;
  const selected = rows.find((shop) => shop.id === shopId) ?? null;

  return (
    <div>
      <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
        <Link
          href={backHref}
          className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
        >
          <ArrowBackIcon fontSize="small" />
          <span>{backLabel}</span>
        </Link>
        <h1 className={`${pageTitle} col-start-2 mt-3 mb-0!`}>
          {isFlyer ? "Fletushkë e re" : "Oferta të reja"}
        </h1>
      </div>

      {stores.isLoading || (businessId && profile.isLoading) ? (
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
                onChange={setShopOverride}
                searchable
                placeholder="Zgjidh dyqanin"
                aria-label="Dyqani"
                options={rows.map((shop) => ({
                  value: shop.id,
                  label: shop.name,
                  logoUrl: shop.logo_url ?? null,
                }))}
              />
            </label>
            <p className="m-0 mt-3 text-sm leading-relaxed text-muted">
              {isFlyer
                ? "Zgjidh dyqanin kryesor. Lokacionet (edhe degët) zgjidhen te “Ku shfaqet”. Ruhet e aprovuar menjëherë."
                : "Zgjidh dyqanin kryesor. Lokacionet (edhe degët) zgjidhen te “Ku shfaqet”. Ruhen të aprovuara menjëherë."}
            </p>
          </section>
          {selected ? (
            <OfferForm
              key={`${selected.id}-${catalog}`}
              mode="create"
              audience="admin"
              businessId={selected.id}
              canShare
              catalog={catalog}
              doneHref={`/admin/businesses/${selected.id}?section=${section}`}
            />
          ) : (
            <p className={panelLead}>Zgjidh një dyqan aktiv me abonim të vlefshëm.</p>
          )}
        </div>
      )}
    </div>
  );
}
