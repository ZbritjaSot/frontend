import type { OfferStatus } from "@/types";

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  draft: "Draft",
  pending: "Në pritje",
  approved: "Aprovuar",
  rejected: "Refuzuar",
  expired: "Skaduar",
};

export function canEditOffer(status: OfferStatus): boolean {
  return status === "draft" || status === "rejected";
}

export function canSubmitOffer(status: OfferStatus): boolean {
  return status === "draft" || status === "rejected";
}

export function canDeleteOffer(status: OfferStatus): boolean {
  return status === "draft" || status === "pending" || status === "rejected";
}
