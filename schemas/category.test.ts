import { describe, expect, it } from "vitest";
import { categoryFormSchema } from "@/schemas/category";

const base = {
  name: "Kafe",
  icon: null,
  is_active: true,
};

describe("category form validation", () => {
  it("allows a blank slug and a lowercase slug of 80 characters", () => {
    expect(categoryFormSchema.safeParse({ ...base, slug: "" }).success).toBe(true);
    expect(categoryFormSchema.safeParse({ ...base, slug: "  " }).success).toBe(true);
    expect(
      categoryFormSchema.safeParse({ ...base, slug: "a".repeat(80) }).success,
    ).toBe(true);
    expect(
      categoryFormSchema.safeParse({ ...base, slug: " kafe_e-re-2 " }).success,
    ).toBe(true);
  });

  it("rejects an oversized or badly formed slug", () => {
    const tooLong = categoryFormSchema.safeParse({
      ...base,
      slug: "a".repeat(81),
    });
    expect(tooLong.success).toBe(false);
    if (!tooLong.success) {
      expect(tooLong.error.issues[0]?.message).toBe("Slug është shumë i gjatë.");
    }

    for (const slug of ["Kafe", "kafe pije", "kafe.pije", "kafë"]) {
      const result = categoryFormSchema.safeParse({ ...base, slug });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Përdor vetëm shkronja të vogla, numra, viza dhe nënviza.",
        );
      }
    }
  });
});
