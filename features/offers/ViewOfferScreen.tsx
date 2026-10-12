"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { bizOfferDetailKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { Spinner } from "@/components/ui/Spinner";
import type { BundleCatalog } from "@/features/offers/bizApi";
import { OfferBundleView } from "@/features/offers/OfferBundleView";
import {
  bundleDisplayTitle,
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

type ViewOfferScreenProps = {
  id: string;
  catalog?: BundleCatalog;
};

export function ViewOfferScreen({ id, catalog = "flyers" }: ViewOfferScreenProps) {
  const router = useRouter();
  const { data: bundle, isLoading, isError, error, refetch } = useBizOffer(id);
  const submitMutation = useSubmitBizOffer();
  const [actionError, setActionError] = useState<string | null>(null);
  const listHref = catalog === "flyers" ? "/biz/flyers" : "/biz/offers";
  const listLabel = catalog === "flyers" ? "Fletushkat" : "Ofertat";

  useEffect(() => {
    if (!bundle) {
      return;
    }
    const actual: BundleCatalog = bundle.is_standalone ? "offers" : "flyers";
    if (actual !== catalog) {
      router.replace(actual === "flyers" ? `/biz/flyers/${id}` : `/biz/offers/${id}`);
    }
  }, [bundle, catalog, id, router]);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar" />;
  }

  if (isError || !bundle) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Nuk u gjet.")}
        </p>
        <Link href={listHref} className={btnGhost}>
          <ArrowBackIcon fontSize="small" />
          {listLabel}
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
  const cover =
    bundle.items?.find((item) => item.image?.id === bundle.cover_gallery_image_id)?.image ??
    bundle.items?.find((item) => item.image)?.image ??
    null;
  const editHref =
    catalog === "flyers" ? `/biz/flyers/${bundle.id}/edit` : `/biz/offers/${bundle.id}/edit`;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
          <Link
            href={listHref}
            className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
          >
            <ArrowBackIcon fontSize="small" />
            <span>{listLabel}</span>
          </Link>
          <div className="col-start-2 mt-3 flex flex-wrap items-center gap-3">
            <h1 className={`${pageTitle} mb-0!`}>{bundleDisplayTitle(bundle)}</h1>
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
            {count}{" "}
            {catalog === "flyers"
              ? count === 1
                ? "produkt"
                : "produkte"
              : count === 1
                ? "ofertë"
                : "oferta"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEditOffer(bundle.status) ? (
            <Link href={editHref} className={btnGhost}>
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

      {cover ? (
        <div className="relative mb-8 aspect-[16/7] overflow-hidden rounded-2xl bg-sunken">
          <Image
            src={cover.detail_url}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="(min-width: 768px) 48rem, 100vw"
          />
        </div>
      ) : null}

      <OfferBundleView bundle={bundle} showHeading={false} showViews />
    </>
  );
}
