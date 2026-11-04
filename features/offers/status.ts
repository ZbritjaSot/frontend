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

/**
 * Public-site URL once a bundle is approved — flyer folders are addressable
 * by bundle id (`/dosje/{bundle}`), but standalone offers have no bundle-level
 * public page: `GET /offers/{offer}` looks up by *item* id, not bundle id, and
 * a standalone bundle can hold more than one item. Returns `null` when there
 * is no single page to link to, or when the backend's own `publiclyVisible()`
 * scope (status + starts_at/expires_at window + business open-to-public)
 * wouldn't actually serve the page yet — callers should drop the "view" action
 * entirely in that case rather than link to a 404 or a future 404.
 *
 * The visibility check here is a best-effort client-side mirror, not exact:
 * `BusinessSummary` doesn't expose `is_approved`/subscription coverage, which
 * the backend scope also requires, so a business failing on those alone
 * (rare — admin-managed, not time-based) can still produce a path that 404s.
 */
export function publicBundlePath(bundle: {
  id: string;
  is_standalone?: boolean;
  starts_at: string;
  expires_at?: string;
  items?: { id: string }[];
  business?: { is_active?: boolean };
}): string | null {
  const now = Date.now();
  if (new Date(bundle.starts_at).getTime() > now) {
    return null;
  }
  if (bundle.expires_at && new Date(bundle.expires_at).getTime() <= now) {
    return null;
  }
  if (bundle.business?.is_active === false) {
    return null;
  }
  if (!bundle.is_standalone) {
    return `/dosje/${bundle.id}`;
  }
  return bundle.items?.length === 1 ? `/offers/${bundle.items[0].id}` : null;
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
