import { describe, expect, it } from "vitest";
import {
  appendGalleryPicks,
  emptyItem,
  isBlankItem,
  itemDraftToPayload,
  type GalleryPick,
} from "@/features/offers/itemDrafts";
import { mapServerOfferErrors } from "@/features/offers/offerFormState";

const categoryId = "018f6b2e-6c3a-7b2a-8f1e-9c0d1e2f3a4b";

function picks(count: number): GalleryPick[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `img-${index + 1}`,
    title: `  Produkt ${index + 1} `,
    thumb_url: `https://cdn.test/${index + 1}/thumb.webp`,
  }));
}

const makeKey = (index: number) => `bulk-${index}`;

describe("appendGalleryPicks", () => {
  it("turns ten picked photos into ten titled rows, replacing the blank starter row", () => {
    const rows = appendGalleryPicks([emptyItem("item-0")], picks(10), { makeKey });

    expect(rows).toHaveLength(10);
    expect(rows.map((row) => row.name)).toEqual(
      Array.from({ length: 10 }, (_, index) => `Produkt ${index + 1}`),
    );
    expect(rows[0]).toMatchObject({
      key: "bulk-0",
      gallery_image_id: "img-1",
      thumb_url: "https://cdn.test/1/thumb.webp",
      mode: "price",
      category_ids: [],
    });
    expect(new Set(rows.map((row) => row.key)).size).toBe(10);
  });

  it("keeps rows the user already filled and appends after them", () => {
    const filled = { ...emptyItem("item-0"), name: "Kafe", original_price: 200 };
    const rows = appendGalleryPicks([filled], picks(2), { makeKey });

    expect(rows.map((row) => row.name)).toEqual(["Kafe", "Produkt 1", "Produkt 2"]);
  });

  it("skips photos already on a row and duplicates inside one pick", () => {
    const first = appendGalleryPicks([emptyItem("item-0")], picks(2), { makeKey });
    const again = appendGalleryPicks(first, [...picks(3), picks(3)[2]], { makeKey });

    expect(again.map((row) => row.gallery_image_id)).toEqual(["img-1", "img-2", "img-3"]);
  });

  it("returns the same rows when nothing new was picked", () => {
    const rows = [emptyItem("item-0")];
    expect(appendGalleryPicks(rows, [], { makeKey })).toBe(rows);
  });

  it("applies a shared category to every new row without sharing the array", () => {
    const rows = appendGalleryPicks([], picks(2), { makeKey, categoryIds: [categoryId] });

    expect(rows.every((row) => row.category_ids[0] === categoryId)).toBe(true);
    expect(rows[0].category_ids).not.toBe(rows[1].category_ids);
    expect(itemDraftToPayload(rows[0])).toMatchObject({
      category_ids: [categoryId],
      name: "Produkt 1",
      gallery_image_id: "img-1",
    });
  });
});

describe("isBlankItem", () => {
  it("treats only an untouched new row as blank", () => {
    expect(isBlankItem(emptyItem("a"))).toBe(true);
    expect(isBlankItem({ ...emptyItem("a"), discount_percent: "10" })).toBe(false);
    expect(isBlankItem({ ...emptyItem("a"), id: "saved" })).toBe(false);
  });
});

describe("mapServerOfferErrors", () => {
  it("puts each rejected row's message on that row", () => {
    const errors = mapServerOfferErrors({
      message: "The given data was invalid.",
      errors: {
        "items.3.gallery_image_id": ["Choose a photo from this shop or the ZbritjaSot gallery."],
        "items.4.purchase_url": ["Enter a valid http or https URL."],
        "items.1.discounted_price": ["Discounted price must be lower."],
        starts_at: ["Too soon."],
      },
    });

    expect(errors).not.toBeNull();
    expect(errors?.count).toBe(4);
    expect(errors?.items[3]).toEqual({
      other: "Zgjidh një foto nga galeria jote ose nga galeria ZbritjaSot.",
    });
    expect(errors?.items[4]).toEqual({
      purchase_url: "Shkruaj një link të vlefshëm http ose https.",
    });
    expect(errors?.items[1]).toEqual({ discounted_price: "Discounted price must be lower." });
    expect(errors?.form.starts_at).toBe("Too soon.");
  });

  it("returns null when there are no field errors", () => {
    expect(mapServerOfferErrors({ message: "Server error" })).toBeNull();
    expect(mapServerOfferErrors(null)).toBeNull();
    expect(mapServerOfferErrors({ errors: {} })).toBeNull();
  });
});
