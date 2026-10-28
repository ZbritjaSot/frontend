import { z } from "zod";
import { earliestOfferStart, OFFER_START_LEAD_HOURS } from "@/lib/datetime";
import { MAX_PRICE_CENTS } from "@/lib/format";

const optionalCents = z
  .number({ error: "Çmimi duhet të jetë numër." })
  .int("Çmimi duhet të jetë i plotë (cent).")
  .positive("Çmimi duhet të jetë më i madh se 0.")
  .max(MAX_PRICE_CENTS, "Çmimi është shumë i lartë.")
  .nullable();

const optionalPercent = z
  .number({ error: "Zbritja duhet të jetë numër." })
  .int("Zbritja duhet të jetë e plotë.")
  .min(1, "Zbritja duhet të jetë midis 1% dhe 99%.")
  .max(99, "Zbritja duhet të jetë midis 1% dhe 99%.")
  .nullable();

const offerItemSchema = z
  .object({
    category_ids: z
      .array(z.string().uuid())
      .min(1, "Zgjidh të paktën një kategori."),
    name: z
      .string()
      .trim()
      .min(1, "Emri i produktit është i detyrueshëm.")
      .max(255, "Emri është shumë i gjatë."),
    original_price: optionalCents,
    discounted_price: optionalCents,
    discount_percent: optionalPercent,
    purchase_url: z
      .string()
      .trim()
      .max(2048, "Linku është shumë i gjatë.")
      .nullable()
      .optional(),
    gallery_image_id: z.string().uuid().nullable().optional(),
  })
  .refine(
    (data) => data.discounted_price !== null || data.discount_percent !== null,
    {
      message: "Vendos çmimin me zbritje ose përqindjen.",
      path: ["discounted_price"],
    },
  )
  .refine(
    (data) => data.discounted_price === null || data.original_price !== null,
    {
      message: "Çmimi origjinal duhet kur vendoset çmimi me zbritje.",
      path: ["original_price"],
    },
  )
  .refine(
    (data) =>
      data.discounted_price === null ||
      data.original_price === null ||
      data.discounted_price < data.original_price,
    {
      message: "Çmimi me zbritje duhet të jetë më i ulët se çmimi origjinal.",
      path: ["discounted_price"],
    },
  );

const offerBundleBaseSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Titulli i fletushkës është i detyrueshëm.")
      .max(255, "Titulli është shumë i gjatë."),
    starts_at: z.string().min(1, "Data e fillimit është e detyrueshme."),
    expires_at: z.string().min(1, "Data e skadimit është e detyrueshme."),
    items: z.array(offerItemSchema).min(1, "Shto të paktën një produkt."),
    cover_gallery_image_id: z.string().uuid().nullable().optional(),
    branch_ids: z.array(z.string().uuid()).optional(),
  })
  .refine((data) => new Date(data.expires_at) > new Date(data.starts_at), {
    message: "Skadimi duhet të jetë pas fillimit.",
    path: ["expires_at"],
  });

export const offerBundleFormSchema = offerBundleBaseSchema.refine(
  (data) => new Date(data.starts_at).getTime() >= earliestOfferStart().getTime(),
  {
    message: `Fillimi duhet të jetë së paku ${OFFER_START_LEAD_HOURS} orë nga tani (kohë për shqyrtim).`,
    path: ["starts_at"],
  },
);

/** Admin publish/edit: same folder rules, without the review lead time. */
export const adminOfferBundleFormSchema = offerBundleBaseSchema;

export type OfferBundleFormInput = z.infer<typeof offerBundleFormSchema>;
export type OfferItemFormInput = z.infer<typeof offerItemSchema>;
