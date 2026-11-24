import { z } from "zod";

export const cityFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Emri i qytetit është i detyrueshëm.")
    .max(255, "Emri është shumë i gjatë."),
  is_active: z.boolean(),
});

export type CityFormInput = z.infer<typeof cityFormSchema>;
