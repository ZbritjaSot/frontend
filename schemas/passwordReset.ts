import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email-i është i detyrueshëm.")
    .email("Email-i nuk është i vlefshëm."),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Fjalëkalimi duhet të ketë të paktën 8 shenja."),
    password_confirmation: z.string().min(1, "Përsërit fjalëkalimin."),
  })
  .refine((value) => value.password === value.password_confirmation, {
    message: "Fjalëkalimet nuk përputhen.",
    path: ["password_confirmation"],
  });
