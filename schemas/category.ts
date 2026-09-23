import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Emri i kategorisë është i detyrueshëm.")
    .max(255, "Emri është shumë i gjatë."),
  slug: z
    .string()
    .trim()
    .max(255, "Slug është shumë i gjatë.")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
