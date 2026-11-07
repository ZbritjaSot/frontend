import { z } from "zod";
import { categoryIconIds } from "@/lib/categoryIcons";

const categorySlugPattern = /^[a-z0-9_-]+$/;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Emri i kategorisë është i detyrueshëm.")
    .max(255, "Emri është shumë i gjatë."),
  slug: z
    .string()
    .trim()
    .max(80, "Slug është shumë i gjatë.")
    .refine((value) => value === "" || categorySlugPattern.test(value), {
      message: "Përdor vetëm shkronja të vogla, numra, viza dhe nënviza.",
    })
    .optional()
    .or(z.literal("")),
  icon: z.enum(categoryIconIds).nullable(),
  is_active: z.boolean(),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
