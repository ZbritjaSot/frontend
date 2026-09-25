import type { OfferStatus } from "@/types";

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  draft: "Draft",
  pending: "Në pritje",
  approved: "Aprovuar",
  taken_down: "Hequr",
  expired: "Skaduar",
};

export function canEditOffer(status: OfferStatus): boolean {
  return status === "draft";
}

export function canSubmitOffer(status: OfferStatus): boolean {
  return status === "draft";
}

export function canDeleteOffer(status: OfferStatus): boolean {
  return status !== "expired";
}
