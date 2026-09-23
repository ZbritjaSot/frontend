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
  const { data: bundle, isLoading, isError, error } = useBizOffer(id);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar dosjen" />;
  }

  if (isError || !bundle) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">
          {validationMessage(error, "Dosja nuk u gjet.")}
        </p>
        <Link href="/biz/offers" className="btn btn--ghost">
          ← Ofertat
        </Link>
      </div>
    );
  }

  if (!canEditOffer(bundle.status)) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">
          Kjo dosje nuk mund të ndryshohet (statusi: {bundle.status}).
        </p>
        <Link href="/biz/offers" className="btn btn--ghost">
          ← Ofertat
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="dash__page-title">Ndrysho dosjen</h1>
      <OfferForm mode="edit" offer={bundle} />
    </>
  );
}
