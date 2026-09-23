import { z } from "zod";

export const businessFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Emri i biznesit është i detyrueshëm.")
    .max(255, "Emri është shumë i gjatë."),
  owner_name: z
    .string()
    .trim()
    .min(1, "Emri i pronarit është i detyrueshëm.")
    .max(255, "Emri është shumë i gjatë."),
  owner_email: z
    .string()
    .trim()
    .email("Email-i nuk është i vlefshëm.")
    .max(255),
  owner_password: z
    .string()
    .min(8, "Fjalëkalimi duhet të ketë të paktën 8 karaktere."),
  is_active: z.boolean(),
});

export type BusinessFormInput = z.infer<typeof businessFormSchema>;
