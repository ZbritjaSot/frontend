"use client";

import { ArrowBackIcon } from "@/components/ui/icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { OfferForm } from "@/features/offers/OfferForm";
import { OFFER_STATUS_LABEL, OFFER_STATUS_HINT } from "@/features/offers/status";
import { useAdminOfferBundle } from "@/hooks/useAdminOffers";
import { validationMessage } from "@/lib/api";
import { safeNextPath } from "@/lib/safeNextPath";
import { button, offerStatusClass, pageTitle, panelLead } from "@/lib/ui";
import { Tooltip } from "@/components/ui/Tooltip";

export function AdminEditOfferScreen({ id }: { id: string }) {
  const params = useSearchParams();
  const back = safeNextPath(params.get("back"), "", ["/admin"]);
  const { data: bundle, isLoading, isError, error } = useAdminOfferBundle(id);
  const dossierHref = back
    ? `/admin/offers/${id}?back=${encodeURIComponent(back)}`
    : `/admin/offers/${id}`;

  if (isLoading) {
    return <Spinner label="Duke ngarkuar fletushkën" />;
  }

  if (isError || !bundle) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Fletushka nuk u gjet.")}
        </p>
        <Link href="/admin/offers" className={button({ variant: "secondary" })}>
          <ArrowBackIcon fontSize="small" />
          Në pritje
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
        <Link
          href={dossierHref}
          className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Fletushka</span>
        </Link>
        <div className="col-start-2 mt-3 flex flex-wrap items-center gap-3">
          <h1 className={`${pageTitle} mb-0!`}>Ndrysho fletushkën</h1>
          <Tooltip content={OFFER_STATUS_HINT[bundle.status]}>
            <span
              className={`${offerStatusClass(bundle.status)} mt-0! self-center!`}>
              {OFFER_STATUS_LABEL[bundle.status]}
            </span>
          </Tooltip>
        </div>
      </div>
      <OfferForm
        mode="edit"
        audience="admin"
        offer={bundle}
        doneHref={dossierHref}
        canShare
      />
    </>
  );
}
