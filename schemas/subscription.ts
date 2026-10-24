import { z } from "zod";
import { MAX_PRICE_CENTS } from "@/lib/format";

export const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Kartë", disabled: true },
] as const;

export const subscriptionFormSchema = z
  .object({
    business_id: z.string().uuid("Zgjidh një biznes."),
    starts_at: z.string().min(1, "Data e fillimit është e detyrueshme."),
    ends_at: z.string().min(1, "Data e mbarimit është e detyrueshme."),
    is_active: z.boolean(),
    payment_method: z.enum(["cash", "card"], {
      error: "Zgjidh metodën e pagesës.",
    }),
    /** Integer cents (POS entry). */
    price: z
      .number({ error: "Çmimi duhet të jetë numër." })
      .int("Çmimi duhet të jetë i plotë (cent).")
      .positive("Çmimi duhet të jetë më i madh se 0.")
      .max(MAX_PRICE_CENTS, "Çmimi është shumë i lartë."),
    payment_note: z
      .string()
      .trim()
      .max(2000, "Shënimi është shumë i gjatë.")
      .optional(),
  })
  .refine((data) => new Date(data.ends_at) > new Date(data.starts_at), {
    message: "Data e mbarimit duhet të jetë pas fillimit.",
    path: ["ends_at"],
  });

export type SubscriptionFormInput = z.infer<typeof subscriptionFormSchema>;
