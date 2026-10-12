import type { OfferStatus } from "@/types";

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  draft: "Draft",
  pending: "Në pritje",
  approved: "Aprovuar",
  taken_down: "Hequr",
  expired: "Skaduar",
};

/** List/detail label for standalone product batches vs flyer folders. */
export function bundleDisplayTitle(bundle: {
  title: string;
  is_standalone?: boolean;
}): string {
  return bundle.is_standalone ? "Oferta individuale" : bundle.title;
}

export function canEditOffer(status: OfferStatus): boolean {
  return status === "draft";
}

export function canSubmitOffer(status: OfferStatus): boolean {
  return status === "draft";
}

export function canDeleteOffer(status: OfferStatus): boolean {
  return status !== "expired";
}
