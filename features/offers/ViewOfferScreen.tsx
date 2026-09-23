"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { OfferBundleView } from "@/features/offers/OfferBundleView";
import { canEditOffer, canSubmitOffer } from "@/features/offers/status";
import { useBizOffer, useSubmitBizOffer } from "@/hooks/useBizOffers";
import { validationMessage } from "@/lib/api";
import { btnGhost, btnPrimary, btnSm, fieldError, panelLead } from "@/lib/ui";
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
        <Link href="/biz/offers" className={`${btnGhost} ${btnSm}`}>
          <ArrowBackIcon fontSize="small" />
          Ofertat
        </Link>
        <div className="flex flex-wrap gap-3">
          {canEditOffer(bundle.status) ? (
            <Link
              href={`/biz/offers/${bundle.id}/edit`}
              className={`${btnGhost} ${btnSm}`}
            >
              Ndrysho
            </Link>
          ) : null}
          {canSubmitOffer(bundle.status) ? (
            <button
              type="button"
              className={`${btnPrimary} ${btnSm}`}
              disabled={submitMutation.isPending}
              onClick={onSubmit}
            >
              {submitMutation.isPending ? "Duke dërguar…" : "Dërgo"}
            </button>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <p className={fieldError} role="alert">
          {actionError}
        </p>
      ) : null}

      <OfferBundleView bundle={bundle} />
    </>
  );
}
