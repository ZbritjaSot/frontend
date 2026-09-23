"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { OfferForm } from "@/features/offers/OfferForm";
import { canEditOffer } from "@/features/offers/status";
import { useBizOffer } from "@/hooks/useBizOffers";
import { validationMessage } from "@/lib/api";
import { btnGhost, pageTitle, panelLead } from "@/lib/ui";

type EditOfferScreenProps = {
  id: string;
};

export function EditOfferScreen({ id }: EditOfferScreenProps) {
  const { data: bundle, isLoading, isError, error } = useBizOffer(id);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar dosjen" />;
  }

  if (isError || !bundle) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Dosja nuk u gjet.")}
        </p>
        <Link href="/biz/offers" className={btnGhost}>
          <ArrowBackIcon fontSize="small" />
          Ofertat
        </Link>
      </div>
    );
  }

  if (!canEditOffer(bundle.status)) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          Kjo dosje nuk mund të ndryshohet (statusi: {bundle.status}).
        </p>
        <Link href="/biz/offers" className={btnGhost}>
          <ArrowBackIcon fontSize="small" />
          Ofertat
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className={pageTitle}>Ndrysho dosjen</h1>
      <OfferForm mode="edit" offer={bundle} />
    </>
  );
}
