import { itemDraftToPayload, type ItemDraft } from "@/features/offers/itemDrafts";

/** Fields of one product row that a Zod issue can point at. */
export type ItemErrorField =
  | "category_ids"
  | "name"
  | "original_price"
  | "discounted_price"
  | "discount_percent"
  | "purchase_url"
  | "other";

export type FormErrorField =
  | "title"
  | "starts_at"
  | "expires_at"
  | "items"
  | "other";

export type OfferFormErrors = {
  /** First message per top-level field. */
  form: Partial<Record<FormErrorField, string>>;
  /** First message per field, keyed by the product's index in `items`. */
  items: Record<number, Partial<Record<ItemErrorField, string>>>;
  /** Number of invalid fields (a row with two bad fields counts twice). */
  count: number;
};

type IssueLike = { path: readonly PropertyKey[]; message: string };

const ITEM_FIELDS: readonly string[] = [
  "category_ids",
  "name",
  "original_price",
  "discounted_price",
  "discount_percent",
  "purchase_url",
];
const FORM_FIELDS: readonly string[] = ["title", "starts_at", "expires_at"];

/**
 * Turns Zod issues for the offer bundle into per-field errors. Paths look like
 * `["items", 2, "name"]` or `["expires_at"]`. The first message per field wins,
 * which matches the order Zod reports them in.
 */
export function mapOfferIssues(issues: readonly IssueLike[]): OfferFormErrors {
  const result: OfferFormErrors = { form: {}, items: {}, count: 0 };

  for (const issue of issues) {
    const [head, index, field] = issue.path;

    if (head === "items" && typeof index === "number") {
      const key: ItemErrorField =
        typeof field === "string" && ITEM_FIELDS.includes(field)
          ? (field as ItemErrorField)
          : "other";
      const row = (result.items[index] ??= {});
      if (!row[key]) {
        row[key] = issue.message;
        result.count += 1;
      }
      continue;
    }

    const key: FormErrorField =
      head === "items"
        ? "items"
        : typeof head === "string" && FORM_FIELDS.includes(head)
          ? (head as FormErrorField)
          : "other";
    if (!result.form[key]) {
      result.form[key] = issue.message;
      result.count += 1;
    }
  }

  return result;
}

/** Number of invalid fields inside one product row. */
export function itemErrorCount(row: Partial<Record<ItemErrorField, string>> | undefined): number {
  return row ? Object.keys(row).length : 0;
}

type SnapshotInput = {
  title: string;
  startsAt: string;
  expiresAt: string;
  items: ItemDraft[];
  coverKey: string | null;
  /** A new flyer image was picked. */
  flyerPicked: boolean;
  /** The existing flyer image was removed. */
  flyerRemoved: boolean;
};

/**
 * Stable string of everything the user can edit, except the shared-location
 * selection (that is seeded asynchronously and compared separately via
 * `sameIds`). Comparing two snapshots tells whether the form is dirty.
 */
export function offerFormSnapshot(input: SnapshotInput): string {
  return JSON.stringify({
    title: input.title.trim(),
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
    items: input.items.map((item) => ({
      ...itemDraftToPayload(item),
      mode: item.mode,
    })),
    cover: input.items.findIndex((item) => item.key === input.coverKey),
    flyerPicked: input.flyerPicked,
    flyerRemoved: input.flyerRemoved,
  });
}

/** Order-insensitive id list comparison. */
export function sameIds(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const set = new Set(a);
  return b.every((id) => set.has(id));
}
