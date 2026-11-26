import { z } from "zod";
import { earliestOfferStart, OFFER_START_LEAD_HOURS } from "@/lib/datetime";
import { computeDiscountPercent, MAX_DISCOUNT_PERCENT, MIN_DISCOUNT_PERCENT } from "@/lib/discount";
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
  .min(MIN_DISCOUNT_PERCENT, "Zbritja duhet të jetë midis 1% dhe 99%.")
  .max(MAX_DISCOUNT_PERCENT, "Zbritja duhet të jetë midis 1% dhe 99%.")
  .nullable();

const offerItemSchema = z
  .object({
    /** Existing offer id (edit only); omitted for new products. */
    id: z.string().uuid().optional(),
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
    /**
     * Which pricing fields the row shows. Not sent to the API (toApiBody picks
     * fields explicitly); it decides which empty field to flag. Without it, a
     * row with no percent is treated as price mode.
     */
    pricing_mode: z.enum(["price", "percent"]).optional(),
  })
  .superRefine((data, ctx) => {
    const flag = (path: "original_price" | "discounted_price" | "discount_percent", message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    const priceMode = data.pricing_mode
      ? data.pricing_mode === "price"
      : data.discount_percent === null;

    if (!priceMode) {
      if (data.original_price !== null || data.discounted_price !== null) {
        flag("discount_percent", "Zgjidh ose çmimet, ose përqindjen, jo të dyja.");
      } else if (data.discount_percent === null) {
        flag("discount_percent", "Vendos përqindjen e zbritjes.");
      }
      return;
    }

    if (data.discount_percent !== null) {
      flag("discount_percent", "Zgjidh ose çmimet, ose përqindjen, jo të dyja.");
    }
    // "Me çmime": both prices are required, and each empty one is flagged on its own field.
    if (data.original_price === null) {
      flag("original_price", "Vendos çmimin e vjetër.");
    }
    if (data.discounted_price === null) {
      flag("discounted_price", "Vendos çmimin e ri.");
    }
    if (data.original_price === null || data.discounted_price === null) {
      return;
    }
    if (data.discounted_price >= data.original_price) {
      flag("discounted_price", "Çmimi me zbritje duhet të jetë më i ulët se çmimi origjinal.");
      return;
    }
    const percent = computeDiscountPercent(data.original_price, data.discounted_price);
    if (percent < MIN_DISCOUNT_PERCENT || percent > MAX_DISCOUNT_PERCENT) {
      flag("discounted_price", "Kjo zbritje është jashtë kufirit të lejuar prej 1%-99%.");
    }
  });

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
