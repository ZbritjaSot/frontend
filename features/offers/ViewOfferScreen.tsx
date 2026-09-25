"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { bizOfferDetailKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { Spinner } from "@/components/ui/Spinner";
import { OfferBundleView } from "@/features/offers/OfferBundleView";
import {
  canEditOffer,
  canSubmitOffer,
  OFFER_STATUS_LABEL,
} from "@/features/offers/status";
import { useBizOffer, useSubmitBizOffer } from "@/hooks/useBizOffers";
import { formatDateShortSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import {
  btnGhost,
  btnPrimary,
  fieldError,
  offerStatusClass,
  pageTitle,
  panelLead,
} from "@/lib/ui";
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

  const count = bundle.items?.length ?? bundle.items_count ?? 0;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
          <Link
            href="/biz/offers"
            className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
          >
            <ArrowBackIcon fontSize="small" />
            <span>Ofertat</span>
          </Link>
          <div className="col-start-2 mt-3 flex flex-wrap items-center gap-3">
            <h1 className={`${pageTitle} mb-0!`}>{bundle.title}</h1>
            <span
              className={`${offerStatusClass(bundle.status)} mt-0! self-center!`}
            >
              {OFFER_STATUS_LABEL[bundle.status]}
            </span>
          </div>
          <p className="col-start-2 m-0 mt-2 text-sm text-muted">
            {formatDateShortSq(bundle.starts_at)} →{" "}
            {formatDateShortSq(bundle.expires_at)}
            {" · "}
            {count} {count === 1 ? "produkt" : "produkte"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEditOffer(bundle.status) ? (
            <Link href={`/biz/offers/${bundle.id}/edit`} className={btnGhost}>
              Ndrysho
            </Link>
          ) : null}
          {canSubmitOffer(bundle.status) ? (
            <button
              type="button"
              className={btnPrimary}
              disabled={submitMutation.isPending}
              onClick={onSubmit}
            >
              {submitMutation.isPending ? "Duke dërguar…" : "Dërgo"}
            </button>
          ) : null}
        </div>
      </div>

      <IndicatorKey items={bizOfferDetailKey} />

      {actionError ? (
        <p className={fieldError} role="alert">
          {actionError}
        </p>
      ) : null}

      <OfferBundleView bundle={bundle} showHeading={false} showViews />
    </>
  );
}
