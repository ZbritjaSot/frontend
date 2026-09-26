import { z } from "zod";

export const businessFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Emri i biznesit është i detyrueshëm.")
    .max(255, "Emri është shumë i gjatë."),
  owner_name: z.string().trim().max(255, "Emri është shumë i gjatë."),
  owner_email: z
    .string()
    .trim()
    .email("Email-i nuk është i vlefshëm.")
    .max(255),
  is_active: z.boolean(),
});

export type BusinessFormInput = z.infer<typeof businessFormSchema>;
