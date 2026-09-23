"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { OfferBundleView } from "@/features/offers/OfferBundleView";
import { canEditOffer, canSubmitOffer } from "@/features/offers/status";
import { useBizOffer, useSubmitBizOffer } from "@/hooks/useBizOffers";
import { validationMessage } from "@/lib/api";
import { useState } from "react";

type ViewOfferScreenProps = {
  id: string;
};

export function ViewOfferScreen({ id }: ViewOfferScreenProps) {
  const { data: bundle, isLoading, isError, error, refetch } = useBizOffer(id);
  const submitMutation = useSubmitBizOffer();
  const [actionError, setActionError] = useState<string | null>(null);

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

  async function onSubmit() {
    setActionError(null);
    try {
      await submitMutation.mutateAsync(bundle!.id);
      await refetch();
    } catch (err) {
      setActionError(
        validationMessage(err, "Nuk mundëm ta dërgojmë për aprovim."),
      );
    }
  }

  return (
    <>
      <div className="bundle-view__toolbar">
        <Link href="/biz/offers" className="btn btn--ghost btn--sm">
          ← Ofertat
        </Link>
        <div className="bundle-view__toolbar-actions">
          {canEditOffer(bundle.status) ? (
            <Link
              href={`/biz/offers/${bundle.id}/edit`}
              className="btn btn--ghost btn--sm"
            >
              Ndrysho
            </Link>
          ) : null}
          {canSubmitOffer(bundle.status) ? (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={submitMutation.isPending}
              onClick={onSubmit}
            >
              {submitMutation.isPending ? "Duke dërguar…" : "Dërgo"}
            </button>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <p className="offer-form__error" role="alert">
          {actionError}
        </p>
      ) : null}

      <OfferBundleView bundle={bundle} />
    </>
  );
}
