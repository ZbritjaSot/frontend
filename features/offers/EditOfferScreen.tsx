"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { OfferForm } from "@/features/offers/OfferForm";
import { canEditOffer } from "@/features/offers/status";
import { useBizOffer } from "@/hooks/useBizOffers";
import { validationMessage } from "@/lib/api";

type EditOfferScreenProps = {
  id: string;
};

export function EditOfferScreen({ id }: EditOfferScreenProps) {
  const { data: offer, isLoading, isError, error } = useBizOffer(id);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar ofertën" />;
  }

  if (isError || !offer) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">
          {validationMessage(error, "Oferta nuk u gjet.")}
        </p>
        <Link href="/biz/offers" className="btn btn--ghost">
          ← Ofertat
        </Link>
      </div>
    );
  }

  if (!canEditOffer(offer.status)) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">
          Kjo ofertë nuk mund të ndryshohet (statusi: {offer.status}).
        </p>
        <Link href="/biz/offers" className="btn btn--ghost">
          ← Ofertat
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="dash__page-title">Ndrysho ofertën</h1>
      <OfferForm mode="edit" offer={offer} />
    </>
  );
}
