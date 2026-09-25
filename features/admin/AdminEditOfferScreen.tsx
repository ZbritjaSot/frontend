"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { OfferForm } from "@/features/offers/OfferForm";
import { OFFER_STATUS_LABEL } from "@/features/offers/status";
import { useAdminOfferBundle } from "@/hooks/useAdminOffers";
import { validationMessage } from "@/lib/api";
import { btnGhost, pageTitle, panelLead } from "@/lib/ui";

export function AdminEditOfferScreen({ id }: { id: string }) {
  const { data: bundle, isLoading, isError, error } = useAdminOfferBundle(id);

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

  if (bundle.status !== "pending") {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          Kjo dosje nuk mund të ndryshohet (statusi:{" "}
          {OFFER_STATUS_LABEL[bundle.status]}).
        </p>
        <Link href={`/admin/offers/${bundle.id}`} className={btnGhost}>
          <ArrowBackIcon fontSize="small" />
          Dosja
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
        <Link
          href={`/admin/offers/${bundle.id}`}
          className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Dosja</span>
        </Link>
        <h1 className={`${pageTitle} col-start-2 mt-3 mb-0!`}>Ndrysho dosjen</h1>
      </div>
      <OfferForm mode="edit" audience="admin" offer={bundle} />
    </>
  );
}
