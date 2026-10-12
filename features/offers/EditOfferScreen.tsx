"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import type { BundleCatalog } from "@/features/offers/bizApi";
import { OfferForm } from "@/features/offers/OfferForm";
import { canEditOffer, OFFER_STATUS_LABEL } from "@/features/offers/status";
import { useBizOffer } from "@/hooks/useBizOffers";
import { validationMessage } from "@/lib/api";
import { btnGhost, pageTitle, panelLead } from "@/lib/ui";

export function OffersBackHeading({
  title,
  children,
  catalog = "flyers",
}: {
  title: string;
  children?: ReactNode;
  catalog?: BundleCatalog;
}) {
  const href = catalog === "flyers" ? "/biz/flyers" : "/biz/offers";
  const label = catalog === "flyers" ? "Fletushkat" : "Ofertat";

  return (
    <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
      <Link
        href={href}
        className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
      >
        <ArrowBackIcon fontSize="small" />
        <span>{label}</span>
      </Link>
      <h1 className={`${pageTitle} col-start-2 mt-3 mb-0!`}>{title}</h1>
      {children ? <div className="col-start-2 mt-2">{children}</div> : null}
    </div>
  );
}

type EditOfferScreenProps = {
  id: string;
  catalog?: BundleCatalog;
};

export function EditOfferScreen({ id, catalog = "flyers" }: EditOfferScreenProps) {
  const router = useRouter();
  const { data: bundle, isLoading, isError, error } = useBizOffer(id);
  const listHref = catalog === "flyers" ? "/biz/flyers" : "/biz/offers";
  const listLabel = catalog === "flyers" ? "Fletushkat" : "Ofertat";

  useEffect(() => {
    if (!bundle) {
      return;
    }
    const actual: BundleCatalog = bundle.is_standalone ? "offers" : "flyers";
    if (actual !== catalog) {
      router.replace(
        actual === "flyers" ? `/biz/flyers/${id}/edit` : `/biz/offers/${id}/edit`,
      );
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

  if (!canEditOffer(bundle.status)) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          Nuk mund të ndryshohet (statusi: {OFFER_STATUS_LABEL[bundle.status]}).
        </p>
        <Link href={listHref} className={btnGhost}>
          <ArrowBackIcon fontSize="small" />
          {listLabel}
        </Link>
      </div>
    );
  }

  return (
    <>
      <OffersBackHeading
        catalog={catalog}
        title={catalog === "flyers" ? "Ndrysho fletushkën" : "Ndrysho ofertat"}
      />
      <OfferForm mode="edit" offer={bundle} catalog={catalog} />
    </>
  );
}
