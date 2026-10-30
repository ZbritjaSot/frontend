import { describe, expect, it } from "vitest";
import { toApiBody } from "@/features/offers/bizApi";
import { earliestOfferStart, toHourLocalValue } from "@/lib/datetime";
import { adminOfferBundleFormSchema } from "@/schemas/offer";

const categoryId = "018f6b2e-6c3a-7b2a-8f1e-9c0d1e2f3a4b";
const existingOfferId = "018f6b2e-6c3a-7b2a-8f1e-9c0d1e2f3a4c";

function item(overrides: Record<string, unknown> = {}) {
  return {
    category_ids: [categoryId],
    name: "Kafe",
    original_price: 2000,
    discounted_price: 1500,
    discount_percent: null,
    purchase_url: null,
    gallery_image_id: null,
    ...overrides,
  };
}

function bundleWindow() {
  const start = earliestOfferStart();
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 14);
  return { starts_at: toHourLocalValue(start), expires_at: toHourLocalValue(end) };
}

describe("toApiBody item ids", () => {
  it("keeps existing offer ids through validation and omits them for new items", () => {
    const parsed = adminOfferBundleFormSchema.parse({
      title: "Fletushkë",
      ...bundleWindow(),
      items: [item({ id: existingOfferId }), item({ name: "E re" })],
    });

    const body = toApiBody(parsed);

    expect(body.items[0]).toMatchObject({ id: existingOfferId, name: "Kafe" });
    expect(body.items[1]).not.toHaveProperty("id");
  });

  it("rejects a non-uuid id such as a client draft key", () => {
    const result = adminOfferBundleFormSchema.safeParse({
      title: "Fletushkë",
      ...bundleWindow(),
      items: [item({ id: "item-0" })],
    });

    expect(result.success).toBe(false);
  });
});
