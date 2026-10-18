"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { OfferForm } from "@/features/offers/OfferForm";
import { OFFER_STATUS_LABEL } from "@/features/offers/status";
import { useAdminOfferBundle } from "@/hooks/useAdminOffers";
import { validationMessage } from "@/lib/api";
import { safeNextPath } from "@/lib/safeNextPath";
import { btnGhost, offerStatusClass, pageTitle, panelLead } from "@/lib/ui";

export function AdminEditOfferScreen({ id }: { id: string }) {
  const params = useSearchParams();
  const back = safeNextPath(params.get("back"), "", ["/admin"]);
  const { data: bundle, isLoading, isError, error } = useAdminOfferBundle(id);
  const dossierHref = back
    ? `/admin/offers/${id}?back=${encodeURIComponent(back)}`
    : `/admin/offers/${id}`;

  if (isLoading) {
    return <Spinner label="Duke ngarkuar dosjen" />;
  }

  if (isError || !bundle) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Dosja nuk u gjet.")}
        </p>
        <Link href="/admin/offers" className={btnGhost}>
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
          <span>Dosja</span>
        </Link>
        <div className="col-start-2 mt-3 flex flex-wrap items-center gap-3">
          <h1 className={`${pageTitle} mb-0!`}>Ndrysho dosjen</h1>
          <span className={`${offerStatusClass(bundle.status)} mt-0! self-center!`}>
            {OFFER_STATUS_LABEL[bundle.status]}
          </span>
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
