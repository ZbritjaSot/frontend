import type { OfferItem } from "@/types";

/** One product row while the offer form is open. */
export type ItemDraft = {
  key: string;
  /** Server offer id; absent for products added in this form. Lets the API update in place. */
  id?: string;
  category_ids: string[];
  name: string;
  /** Integer cents (POS). */
  original_price: number;
  /** Integer cents (POS). */
  discounted_price: number;
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

/** Editable row → form payload item. `id` is sent only for products that already exist. */
export function itemDraftToPayload({
  id,
  category_ids,
  name,
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
    original_price: original_price > 0 ? original_price : null,
    discounted_price: discounted_price > 0 ? discounted_price : null,
    discount_percent:
      discount_percent.trim() === "" ? null : Number(discount_percent),
    purchase_url: purchase_url.trim() === "" ? null : purchase_url.trim(),
    gallery_image_id,
  };
}
