import { z } from "zod";
import { MAX_PRICE_CENTS } from "@/lib/format";

const centsPrice = z
  .number({ error: "Çmimi duhet të jetë numër." })
  .int("Çmimi duhet të jetë i plotë (cent).")
  .positive("Çmimi duhet të jetë më i madh se 0.")
  .max(MAX_PRICE_CENTS, "Çmimi është shumë i lartë.");

const offerItemSchema = z
  .object({
    category_id: z.string().uuid("Zgjidh një kategori."),
    name: z
      .string()
      .trim()
      .min(1, "Emri i produktit është i detyrueshëm.")
      .max(255, "Emri është shumë i gjatë."),
    /** Integer cents (POS entry). */
    original_price: centsPrice,
    /** Integer cents (POS entry). */
    discounted_price: centsPrice,
    gallery_image_id: z.string().uuid().nullable().optional(),
  })
  .refine((data) => data.discounted_price < data.original_price, {
    message: "Çmimi me zbritje duhet të jetë më i ulët se çmimi origjinal.",
    path: ["discounted_price"],
  })
  .refine(
    (data) => {
      const percent = Math.round(
        ((data.original_price - data.discounted_price) / data.original_price) *
          100,
      );
      return percent >= 1 && percent <= 99;
    },
    {
      message: "Zbritja duhet të jetë midis 1% dhe 99%.",
      path: ["discounted_price"],
    },
  );

export const offerBundleFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Titulli i dosjes është i detyrueshëm.")
      .max(255, "Titulli është shumë i gjatë."),
    starts_at: z.string().min(1, "Data e fillimit është e detyrueshme."),
    expires_at: z.string().min(1, "Data e skadimit është e detyrueshme."),
    items: z.array(offerItemSchema).min(1, "Shto të paktën një produkt."),
    cover_gallery_image_id: z.string().uuid().nullable().optional(),
  })
  .refine((data) => new Date(data.expires_at) > new Date(data.starts_at), {
    message: "Skadimi duhet të jetë pas fillimit.",
    path: ["expires_at"],
  });

export type OfferBundleFormInput = z.infer<typeof offerBundleFormSchema>;
export type OfferItemFormInput = z.infer<typeof offerItemSchema>;

/** @deprecated Use offerBundleFormSchema */
export const offerFormSchema = offerBundleFormSchema;
/** @deprecated Use OfferBundleFormInput */
export type OfferFormInput = OfferBundleFormInput;
