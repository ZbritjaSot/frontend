import { describe, expect, it } from "vitest";
import { MAX_PRICE_CENTS } from "@/lib/format";
import { offerBundleFormSchema } from "@/schemas/offer";

const categoryId = "018f6b2e-6c3a-7b2a-8f1e-9c0d1e2f3a4b";

function folder(overrides: Record<string, unknown> = {}) {
  return {
    title: "Kafe e javës",
    starts_at: "2026-09-01T08:00",
    expires_at: "2026-09-30T20:00",
    items: [
      {
        category_ids: [categoryId],
        name: "Espresso",
        original_price: 200,
        discounted_price: 140,
        discount_percent: null,
      },
    ],
    ...overrides,
  };
}

function messages(input: unknown): string[] {
  const result = offerBundleFormSchema.safeParse(input);
  if (result.success) {
    return [];
  }
  return result.error.issues.map((issue) => issue.message);
}

describe("offer form validation", () => {
  it("accepts a price, a percent, or both", () => {
    expect(offerBundleFormSchema.safeParse(folder()).success).toBe(true);
    expect(
      offerBundleFormSchema.safeParse(
        folder({
          items: [
            {
              category_ids: [categoryId],
              name: "Qumësht",
              original_price: null,
              discounted_price: null,
              discount_percent: 20,
            },
          ],
        }),
      ).success,
    ).toBe(true);
    expect(
      offerBundleFormSchema.safeParse(
        folder({
          items: [
            {
              category_ids: [categoryId],
              name: "Bukë",
              original_price: 200,
              discounted_price: 140,
              discount_percent: 25,
            },
          ],
        }),
      ).success,
    ).toBe(true);
  });

  it("requires a campaign title, a product, and an end date after the start", () => {
    expect(messages(folder({ title: "  " }))).toContain(
      "Titulli i fletushkës është i detyrueshëm.",
    );
    expect(messages(folder({ items: [] }))).toContain(
      "Shto të paktën një produkt.",
    );
    expect(
      messages(folder({ starts_at: "2026-09-30T20:00", expires_at: "2026-09-01T08:00" })),
    ).toContain("Skadimi duhet të jetë pas fillimit.");
  });

  it("rejects prices that are not positive integer cents", () => {
    const item = folder().items[0];
    expect(messages(folder({ items: [{ ...item, original_price: 0 }] }))).toContain(
      "Çmimi duhet të jetë më i madh se 0.",
    );
    expect(messages(folder({ items: [{ ...item, original_price: 10.5 }] }))).toContain(
      "Çmimi duhet të jetë i plotë (cent).",
    );
    expect(
      messages(folder({ items: [{ ...item, original_price: MAX_PRICE_CENTS + 1 }] })),
    ).toContain("Çmimi është shumë i lartë.");
  });

  it("requires one of price or percent, and a lower sale price", () => {
    const item = folder().items[0];
    expect(
      messages(
        folder({
          items: [{ ...item, original_price: null, discounted_price: null, discount_percent: null }],
        }),
      ),
    ).toContain("Vendos çmimin me zbritje ose përqindjen.");
    expect(
      messages(folder({ items: [{ ...item, discounted_price: 200 }] })),
    ).toContain("Çmimi me zbritje duhet të jetë më i ulët se çmimi origjinal.");
    expect(
      messages(folder({ items: [{ ...item, discount_percent: 0 }] })),
    ).toContain("Zbritja duhet të jetë midis 1% dhe 99%.");
  });
});
