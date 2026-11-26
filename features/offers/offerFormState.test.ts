import { describe, expect, it } from "vitest";
import { emptyItem } from "@/features/offers/itemDrafts";
import {
  itemErrorCount,
  mapOfferIssues,
  offerFormSnapshot,
  sameIds,
} from "@/features/offers/offerFormState";
import { offerBundleFormSchema } from "@/schemas/offer";

describe("mapOfferIssues", () => {
  it("maps item and form paths to rows and fields, first message wins", () => {
    const errors = mapOfferIssues([
      { path: ["items", 1, "name"], message: "Emri" },
      { path: ["items", 1, "name"], message: "Tjetër" },
      { path: ["items", 1, "discounted_price"], message: "Çmimi" },
      { path: ["items", 0, "category_ids"], message: "Kategoria" },
      { path: ["items"], message: "Shto produkt" },
      { path: ["expires_at"], message: "Skadimi" },
      { path: [], message: "Rrënja" },
    ]);

    expect(errors.items[1]).toEqual({ name: "Emri", discounted_price: "Çmimi" });
    expect(errors.items[0]).toEqual({ category_ids: "Kategoria" });
    expect(errors.form).toEqual({
      items: "Shto produkt",
      expires_at: "Skadimi",
      other: "Rrënja",
    });
    expect(errors.count).toBe(6);
    expect(itemErrorCount(errors.items[1])).toBe(2);
    expect(itemErrorCount(undefined)).toBe(0);
  });

  it("routes unknown item fields to `other`", () => {
    const errors = mapOfferIssues([{ path: ["items", 0, "id"], message: "x" }]);
    expect(errors.items[0]).toEqual({ other: "x" });
  });

  it("maps real schema issues for an empty product", () => {
    const parsed = offerBundleFormSchema.safeParse({
      title: "Nëntor",
      starts_at: "2000-01-01T00:00",
      expires_at: "2000-01-02T00:00",
      items: [
        {
          category_ids: [],
          name: "",
          original_price: null,
          discounted_price: null,
          discount_percent: null,
          purchase_url: null,
          gallery_image_id: null,
        },
      ],
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const errors = mapOfferIssues(parsed.error.issues);
    expect(errors.items[0]?.name).toBe("Emri i produktit është i detyrueshëm.");
    expect(errors.items[0]?.category_ids).toBe("Zgjidh të paktën një kategori.");
    expect(errors.items[0]?.original_price).toBe("Vendos çmimin e vjetër.");
    expect(errors.items[0]?.discounted_price).toBe("Vendos çmimin e ri.");
    expect(errors.form.starts_at).toBeDefined();
  });
});

describe("offerFormSnapshot", () => {
  const base = {
    title: "A",
    startsAt: "s",
    expiresAt: "e",
    items: [emptyItem("item-0")],
    coverKey: null,
    flyerPicked: false,
    flyerRemoved: false,
  };

  it("is stable for equal input and ignores title whitespace", () => {
    expect(offerFormSnapshot(base)).toBe(
      offerFormSnapshot({ ...base, title: " A ", items: [emptyItem("item-9")] }),
    );
  });

  it("changes on edits", () => {
    const snap = offerFormSnapshot(base);
    expect(offerFormSnapshot({ ...base, title: "B" })).not.toBe(snap);
    expect(offerFormSnapshot({ ...base, items: [{ ...emptyItem("item-0"), name: "x" }] })).not.toBe(snap);
    expect(offerFormSnapshot({ ...base, items: [{ ...emptyItem("item-0"), mode: "percent" }] })).not.toBe(snap);
    expect(offerFormSnapshot({ ...base, items: [...base.items, emptyItem("b")] })).not.toBe(snap);
    expect(offerFormSnapshot({ ...base, flyerPicked: true })).not.toBe(snap);
    expect(offerFormSnapshot({ ...base, flyerRemoved: true })).not.toBe(snap);
  });
});

describe("sameIds", () => {
  it("ignores order but not membership", () => {
    expect(sameIds(["a", "b"], ["b", "a"])).toBe(true);
    expect(sameIds(["a"], ["a", "b"])).toBe(false);
    expect(sameIds(["a", "b"], ["a", "c"])).toBe(false);
  });
});
