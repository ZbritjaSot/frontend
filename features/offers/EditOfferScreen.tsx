"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { OfferForm } from "@/features/offers/OfferForm";
import { canEditOffer, OFFER_STATUS_LABEL } from "@/features/offers/status";
import { useBizOffer } from "@/hooks/useBizOffers";
import { validationMessage } from "@/lib/api";
import { btnGhost, pageTitle, panelLead } from "@/lib/ui";

export function OffersBackHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
      <Link
        href="/biz/offers"
        className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Ofertat</span>
      </Link>
      <h1 className={`${pageTitle} col-start-2 mt-3 mb-0!`}>{title}</h1>
      {children ? <div className="col-start-2 mt-2">{children}</div> : null}
    </div>
  );
}

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
          Kjo dosje nuk mund të ndryshohet (statusi:{" "}
          {OFFER_STATUS_LABEL[bundle.status]}).
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
      <OffersBackHeading title="Ndrysho dosjen" />
      <OfferForm mode="edit" offer={bundle} />
    </>
  );
}
