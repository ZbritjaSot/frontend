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
        category_id: categoryId,
        name: "Espresso",
        original_price: 200,
        discounted_price: 140,
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
  it("accepts a folder with a 30 percent discount in cents", () => {
    expect(offerBundleFormSchema.safeParse(folder()).success).toBe(true);
  });

  it("requires a title, a product, and an end date after the start", () => {
    expect(messages(folder({ title: "  " }))).toContain(
      "Titulli i dosjes është i detyrueshëm.",
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

  it("requires the discounted price to be lower and the percent to stay from 1 to 99", () => {
    const item = folder().items[0];
    expect(
      messages(folder({ items: [{ ...item, discounted_price: 200 }] })),
    ).toContain("Çmimi me zbritje duhet të jetë më i ulët se çmimi origjinal.");
    expect(
      messages(
        folder({
          items: [{ ...item, original_price: 1000, discounted_price: 996 }],
        }),
      ),
    ).toContain("Zbritja duhet të jetë midis 1% dhe 99%.");
    expect(
      messages(
        folder({
          items: [{ ...item, original_price: 200, discounted_price: 1 }],
        }),
      ),
    ).toContain("Zbritja duhet të jetë midis 1% dhe 99%.");
  });
});
