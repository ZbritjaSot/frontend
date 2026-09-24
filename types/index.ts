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

/** Admin category payload (matches CategoryResource). */
export type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type BusinessSummary = {
  id: string;
  name: string;
  street?: string | null;
  village?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active?: boolean;
};

/** Admin business payload (matches BusinessResource). */
export type Business = {
  id: string;
  name: string;
  street?: string | null;
  village?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
  owner?: User | null;
  created_at?: string;
  updated_at?: string;
};

/** Admin subscription (matches SubscriptionResource). */
export type PaymentMethod = "cash" | "card";

export type Subscription = {
  id: string;
  business_id: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  is_current: boolean;
  payment_method: PaymentMethod;
  /** Integer cents (e.g. 5000 = 50.00 EUR). */
  price: number;
  payment_note: string | null;
  business?: BusinessSummary;
  created_at?: string;
  updated_at?: string;
};

/** Biz read-only status — no payment_note. */
export type BizSubscription = {
  id: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  is_current: boolean;
};

/** Shared window meta from the parent offer folder. */
export type OfferBundleSummary = {
  id: string;
  title: string;
  starts_at: string;
  expires_at: string;
};

/** Product line inside a folder (biz/admin). */
export type OfferItem = {
  id: string;
  name: string;
  /** Integer cents. */
  original_price: number;
  /** Integer cents. */
  discounted_price: number;
  discount_percent: number;
  /** Set when admin flagged this product on reject. */
  rejection_note?: string | null;
  category?: CategorySummary;
};

/** Public offer payload (flat product; dates from bundle). */
/** Public shop page. No owner, email, or subscription fields. */
export type PublicBusiness = {
  id: string;
  name: string;
  street?: string | null;
  village?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

/** Public offer folder: one shop, one title, its products. */
export type PublicFolder = {
  id: string;
  title: string;
  starts_at: string;
  expires_at: string;
  business?: BusinessSummary | null;
  /** Set on the public list. The detail response includes `items` instead. */
  items_count?: number;
  /** Strongest discount in the folder. Set on the list so the page does not need every product. */
  lead_discount_percent?: number | null;
  items: PublicOffer[];
};

export type PublicOffer = {
  id: string;
  name: string;
  /** Integer cents. */
  original_price: number;
  /** Integer cents. */
  discounted_price: number;
  discount_percent: number;
  starts_at: string;
  expires_at: string;
  bundle?: OfferBundleSummary | null;
  category?: CategorySummary;
  business?: BusinessSummary;
};

/** Biz / admin offer folder (matches OfferBundleResource). */
export type OfferBundle = {
  id: string;
  title: string;
  starts_at: string;
  expires_at: string;
  status: OfferStatus;
  rejection_reason: string | null;
  items_count?: number;
  items?: OfferItem[];
  business?: BusinessSummary;
  created_at?: string;
  updated_at?: string;
};

/** @deprecated Prefer OfferBundle — kept for transitional imports. */
export type Offer = OfferBundle;

export type User = {
  id: string;
  name: string;
  email: string;
  must_change_password?: boolean;
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
