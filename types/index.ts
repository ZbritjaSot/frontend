export type OfferStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "expired";

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
};

export type BusinessSummary = {
  id: string;
  name: string;
  is_active?: boolean;
};

/** Public offer payload (matches Laravel PublicOfferResource). */
export type PublicOffer = {
  id: string;
  name: string;
  original_price: string;
  discounted_price: string;
  discount_percent: number;
  starts_at: string;
  expires_at: string;
  category?: CategorySummary;
  business?: BusinessSummary;
};

/** Admin / biz offer payload (matches OfferResource). */
export type Offer = PublicOffer & {
  status: OfferStatus;
  rejection_reason: string | null;
  created_at?: string;
  updated_at?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  roles?: string[];
};

export type Paginated<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: unknown;
};
