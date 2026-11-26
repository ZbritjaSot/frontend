import { inferPricingMode, type PricingMode } from "@/lib/discount";
import type { OfferItem } from "@/types";

/** One product row while the offer form is open. */
export type ItemDraft = {
  key: string;
  /** Server offer id; absent for products added in this form. Lets the API update in place. */
  id?: string;
  category_ids: string[];
  name: string;
  /** Which fields below are live. Only the active mode's fields are sent to the API. */
  mode: PricingMode;
  /** Integer cents (POS). Price mode only. */
  original_price: number;
  /** Integer cents (POS). Price mode only. */
  discounted_price: number;
  /** Percent mode only. */
  discount_percent: string;
  /** Optional external retailer purchase link. */
  purchase_url: string;
  gallery_image_id: string | null;
  thumb_url: string | null;
  rejection_note?: string | null;
};

export function emptyItem(key: string): ItemDraft {
  return {
    key,
    category_ids: [],
    name: "",
    mode: "price",
    original_price: 0,
    discounted_price: 0,
    discount_percent: "",
    purchase_url: "",
    gallery_image_id: null,
    thumb_url: null,
    rejection_note: null,
  };
}

/** Saved products → editable rows. Keeps each offer id so a save updates it in place. */
export function itemDraftsFromOffer(items: OfferItem[]): ItemDraft[] {
  return items.map((item, index) => ({
    key: item.id ?? `item-${index}`,
    id: item.id,
    category_ids: item.categories?.map((category) => category.id) ?? [],
    name: item.name,
    mode: inferPricingMode(item),
    original_price: item.original_price ?? 0,
    discounted_price: item.discounted_price ?? 0,
    discount_percent:
      item.discount_percent == null ? "" : String(item.discount_percent),
    purchase_url: item.purchase_url ?? "",
    gallery_image_id: item.image?.id ?? null,
    thumb_url: item.image?.thumb_url ?? null,
    rejection_note: item.rejection_note ?? null,
  }));
}

/**
 * Editable row → form payload item. `id` is sent only for products that already
 * exist. Only the active mode's fields are sent — the other mode's leftover
 * field state (e.g. a percent typed before switching to price mode) is always
 * nulled out, so the two modes can never both reach the API at once.
 */
export function itemDraftToPayload({
  id,
  category_ids,
  name,
  mode,
  original_price,
  discounted_price,
  discount_percent,
  purchase_url,
  gallery_image_id,
}: ItemDraft) {
  return {
    ...(id ? { id } : {}),
    category_ids,
    name,
    original_price: mode === "price" && original_price > 0 ? original_price : null,
    discounted_price: mode === "price" && discounted_price > 0 ? discounted_price : null,
    discount_percent:
      mode === "percent" && discount_percent.trim() !== ""
        ? Number(discount_percent)
        : null,
    purchase_url: purchase_url.trim() === "" ? null : purchase_url.trim(),
    gallery_image_id,
    pricing_mode: mode,
  };
}

/** A gallery photo picked for a new product row. */
export type GalleryPick = {
  id: string;
  title?: string | null;
  thumb_url: string;
};

/** A row nobody has touched yet: the empty starter row of a new form. */
export function isBlankItem(item: ItemDraft): boolean {
  return (
    !item.id &&
    item.name.trim() === "" &&
    item.gallery_image_id === null &&
    item.category_ids.length === 0 &&
    item.original_price === 0 &&
    item.discounted_price === 0 &&
    item.discount_percent.trim() === "" &&
    item.purchase_url.trim() === ""
  );
}

/**
 * Bulk gallery selection → product rows. Each photo becomes one row titled from
 * the photo (still editable). Untouched blank rows are replaced, so picking ten
 * photos on a new form gives exactly ten rows. Photos already on a row are
 * skipped so a second pick never duplicates a product.
 */
export function appendGalleryPicks(
  items: ItemDraft[],
  picks: readonly GalleryPick[],
  options: { makeKey: (index: number) => string; categoryIds?: string[] },
): ItemDraft[] {
  const taken = new Set(
    items.map((item) => item.gallery_image_id).filter((id): id is string => Boolean(id)),
  );
  const added: ItemDraft[] = [];
  for (const pick of picks) {
    if (taken.has(pick.id)) {
      continue;
    }
    taken.add(pick.id);
    added.push({
      ...emptyItem(options.makeKey(added.length)),
      name: pick.title?.trim() ?? "",
      gallery_image_id: pick.id,
      thumb_url: pick.thumb_url,
      category_ids: [...(options.categoryIds ?? [])],
    });
  }
  if (added.length === 0) {
    return items;
  }
  return [...items.filter((item) => !isBlankItem(item)), ...added];
}
