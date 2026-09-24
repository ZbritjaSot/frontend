import type { BusinessSummary, PublicFolder, PublicOffer } from "@/types";

export function byDiscount(offers: PublicOffer[]): PublicOffer[] {
  return [...offers].sort((a, b) => b.discount_percent - a.discount_percent);
}

export function endingSoon(
  offers: PublicOffer[],
  withinDays = 5,
): PublicOffer[] {
  const now = Date.now();
  const limit = now + withinDays * 24 * 60 * 60 * 1000;

  return offers
    .filter((offer) => {
      const time = new Date(offer.expires_at).getTime();
      return Number.isFinite(time) && time >= now && time <= limit;
    })
    .sort(
      (a, b) =>
        new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime(),
    );
}

export function leadProduct(folder: PublicFolder): PublicOffer | null {
  if (folder.items.length === 0) {
    return null;
  }
  return byDiscount(folder.items)[0] ?? null;
}

export type ShopPresence = {
  business: BusinessSummary;
  campaigns: number;
};

export function uniqueShops(folders: PublicFolder[]): ShopPresence[] {
  const shops = new Map<string, ShopPresence>();

  for (const folder of folders) {
    const business = folder.business;
    if (!business) {
      continue;
    }
    const existing = shops.get(business.id);
    if (existing) {
      existing.campaigns += 1;
    } else {
      shops.set(business.id, { business, campaigns: 1 });
    }
  }

  return [...shops.values()];
}

export function folderCount(folder: PublicFolder): number {
  if (typeof folder.items_count === "number") {
    return folder.items_count;
  }

  return folder.items.length;
}

export function productWord(count: number): string {
  return count === 1 ? "produkt" : "produkte";
}

export function campaignWord(count: number): string {
  return count === 1 ? "fletushkë" : "fletushka";
}

export function withCampaign(folder: PublicFolder): PublicOffer[] {
  return folder.items.map((item) => ({
    ...item,
    business: item.business ?? folder.business ?? undefined,
    starts_at: item.starts_at || folder.starts_at,
    expires_at: item.expires_at || folder.expires_at,
    bundle: item.bundle ?? {
      id: folder.id,
      title: folder.title,
      starts_at: folder.starts_at,
      expires_at: folder.expires_at,
    },
  }));
}

export function savingsCents(original: number, discounted: number): number {
  return Math.max(0, original - discounted);
}
