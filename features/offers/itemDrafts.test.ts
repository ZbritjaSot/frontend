import { describe, expect, it } from "vitest";
import { toApiBody } from "@/features/offers/bizApi";
import {
  emptyItem,
  itemDraftsFromOffer,
  itemDraftToPayload,
} from "@/features/offers/itemDrafts";
import { earliestOfferStart, toHourLocalValue } from "@/lib/datetime";
import { adminOfferBundleFormSchema } from "@/schemas/offer";
import type { OfferItem } from "@/types";

const categoryId = "018f6b2e-6c3a-7b2a-8f1e-9c0d1e2f3a4b";
const savedOfferId = "018f6b2e-6c3a-7b2a-8f1e-9c0d1e2f3a4c";

const savedItem: OfferItem = {
  id: savedOfferId,
  name: "Kafe",
  image: null,
  original_price: 2000,
  discounted_price: 1500,
  discount_percent: null,
  purchase_url: null,
  view_count: 42,
  rejection_note: null,
  categories: [{ id: categoryId, name: "Pije", slug: "pije" }],
};

function bundleWindow() {
  const start = earliestOfferStart();
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 14);
  return { starts_at: toHourLocalValue(start), expires_at: toHourLocalValue(end) };
}

describe("offer form item mapping", () => {
  it("carries a saved offer id from the server through to the API body", () => {
    const [draft] = itemDraftsFromOffer([savedItem]);
    expect(draft.id).toBe(savedOfferId);

    const added = {
      ...emptyItem(`item-${Date.now()}`),
      name: "E re",
      category_ids: [categoryId],
      original_price: 1000,
      discounted_price: 800,
    };

    const payloadItems = [draft, added].map(itemDraftToPayload);
    expect(payloadItems[0]).toMatchObject({ id: savedOfferId, name: "Kafe" });
    expect(payloadItems[1]).not.toHaveProperty("id");

    const parsed = adminOfferBundleFormSchema.parse({
      title: "Fletushkë",
      ...bundleWindow(),
      items: payloadItems,
    });
    const body = toApiBody(parsed);

    expect(body.items[0]).toMatchObject({ id: savedOfferId });
    expect(body.items[1]).not.toHaveProperty("id");
  });

  it("never sends the client-side draft key as an id", () => {
    const payload = itemDraftToPayload(emptyItem("item-0"));

    expect(payload).not.toHaveProperty("id");
    expect(Object.values(payload)).not.toContain("item-0");
  });
});
