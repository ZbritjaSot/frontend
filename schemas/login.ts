import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email-i është i detyrueshëm.")
    .email("Email-i nuk është i vlefshëm."),
  password: z.string().min(1, "Fjalëkalimi është i detyrueshëm."),
});

export type LoginInput = z.infer<typeof loginSchema>;
