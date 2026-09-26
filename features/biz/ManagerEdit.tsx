"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { OfferForm } from "@/features/offers/OfferForm";
import { OFFER_STATUS_LABEL } from "@/features/offers/status";
import { useManagerBundle } from "@/hooks/useManagerReview";
import { validationMessage } from "@/lib/api";
import { btnGhost, pageTitle, panelLead } from "@/lib/ui";

export function ManagerEdit({ id }: { id: string }) {
  const { data: bundle, isLoading, isError, error } = useManagerBundle(id);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar dosjen" />;
  }

  if (isError || !bundle) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>{validationMessage(error, "Dosja nuk u gjet.")}</p>
        <Link href="/biz" className={btnGhost}>
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
          Kjo dosje nuk mund të ndryshohet (statusi: {OFFER_STATUS_LABEL[bundle.status]}).
        </p>
        <Link href={`/biz/review/${bundle.id}`} className={btnGhost}>
          <ArrowBackIcon fontSize="small" />
          Dosja
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href={`/biz/review/${bundle.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted no-underline hover:text-ink"
        >
          <ArrowBackIcon fontSize="small" />
          Dosja
        </Link>
        <h1 className={`${pageTitle} mt-3 mb-0!`}>Ndrysho dosjen</h1>
      </div>
      <OfferForm mode="edit" audience="manager" offer={bundle} />
    </>
  );
}
