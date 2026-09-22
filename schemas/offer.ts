import { z } from "zod";

export const offerFormSchema = z
  .object({
    category_id: z.string().uuid("Zgjidh një kategori."),
    name: z
      .string()
      .trim()
      .min(1, "Emri i produktit është i detyrueshëm.")
      .max(255, "Emri është shumë i gjatë."),
    original_price: z.coerce
      .number({ error: "Çmimi origjinal duhet të jetë numër." })
      .positive("Çmimi origjinal duhet të jetë më i madh se 0."),
    discounted_price: z.coerce
      .number({ error: "Çmimi me zbritje duhet të jetë numër." })
      .positive("Çmimi me zbritje duhet të jetë më i madh se 0."),
    starts_at: z.string().min(1, "Data e fillimit është e detyrueshme."),
    expires_at: z.string().min(1, "Data e skadimit është e detyrueshme."),
  })
  .refine((data) => data.discounted_price < data.original_price, {
    message: "Çmimi me zbritje duhet të jetë më i ulët se çmimi origjinal.",
    path: ["discounted_price"],
  })
  .refine((data) => new Date(data.expires_at) > new Date(data.starts_at), {
    message: "Skadimi duhet të jetë pas fillimit.",
    path: ["expires_at"],
  });

export type OfferFormInput = z.infer<typeof offerFormSchema>;
