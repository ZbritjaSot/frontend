export type OfferStatus =
  | "draft"
  | "pending"
  | "approved"
  | "taken_down"
  | "expired";

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
};

/** Admin category payload (matches CategoryResource). */
export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
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
  parent_id?: string | null;
  is_active?: boolean;
  extra_placement?: boolean;
  logo_url?: string | null;
};

/** Admin business payload (matches BusinessResource). */
export type Business = {
  id: string;
  parent_id?: string | null;
  parent?: { id: string; name: string } | null;
  manager?: { name: string; email: string } | null;
  name: string;
  street?: string | null;
  village?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  pending_street?: string | null;
  pending_village?: string | null;
  pending_city?: string | null;
  pending_address?: string | null;
  pending_latitude?: number | null;
  pending_longitude?: number | null;
  location_status?: "pending" | "rejected" | null;
  location_rejection_note?: string | null;
  is_active: boolean;
  is_approved?: boolean;
  extra_placement?: boolean;
  logo_url?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  whatsapp?: string | null;
  owner?: User | null;
  branches?: Business[];
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

/** Public photo variants. The original file is never returned. */
export type OfferImage = {
  id: string;
  thumb_url: string;
  detail_url: string;
  title?: string | null;
  source?: "business" | "platform";
};

/** Product line inside a folder (biz/admin). */
export type OfferItem = {
  id: string;
  name: string;
  image?: OfferImage | null;
  /** Integer cents. Empty when the line is percent only. */
  original_price: number | null;
  /** Integer cents. Empty when the line is percent only. */
  discounted_price: number | null;
  discount_percent: number | null;
  /** Public opens of this product. Shop panel only. */
  view_count: number;
  /** Set when admin takes the flyer down. */
  rejection_note?: string | null;
  categories?: CategorySummary[];
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
  logo_url?: string | null;
  parent_id?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  whatsapp?: string | null;
  flyers_count?: number;
  offers_count?: number;
  /** Public locations in this company. Set on the directory for the main shop. */
  locations_count?: number;
  /** Main shop first, then public branches. Shop page only. */
  locations?: CompanyShop[];
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
  /** Photo the shop chose for the flyer card. */
  cover?: {
    id: string;
    name: string;
    thumb_url: string;
    detail_url: string;
  } | null;
  items: PublicOffer[];
  /** Other public branches that carry this flyer. Detail only. */
  also_at?: BusinessSummary[];
};

export type PublicOffer = {
  id: string;
  name: string;
  image?: OfferImage | null;
  /** Integer cents. Empty when the line is percent only. */
  original_price: number | null;
  /** Integer cents. Empty when the line is percent only. */
  discounted_price: number | null;
  discount_percent: number | null;
  starts_at: string;
  expires_at: string;
  bundle?: OfferBundleSummary | null;
  categories?: CategorySummary[];
  business?: BusinessSummary;
  /** Other public branches that carry this product. Detail only. */
  also_at?: BusinessSummary[];
};

/** Biz / admin offer folder (matches OfferBundleResource). */
export type OfferBundle = {
  id: string;
  title: string;
  starts_at: string;
  expires_at: string;
  status: OfferStatus;
  /** True = product offers (not a public flyer folder). */
  is_standalone?: boolean;
  rejection_reason: string | null;
  cover_gallery_image_id?: string | null;
  items_count?: number;
  items?: OfferItem[];
  business?: BusinessSummary;
  branches?: Array<{ id: string; name: string; city?: string | null }>;
  /** Admin pending list: company has an assigned manager. */
  awaits_manager?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type OfferViewDay = {
  date: string;
  views: number;
};

export type OfferViewRange = 7 | 14 | 30;

export type OfferViewSummary = {
  total: number;
  top: Array<{
    id: string;
    name: string;
    view_count: number;
  }>;
  days: OfferViewDay[];
};

/** @deprecated Prefer OfferBundle — kept for transitional imports. */
export type Offer = OfferBundle;

export type CompanyShop = {
  id: string;
  name: string;
  street?: string | null;
  city?: string | null;
  village?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  parent_id?: string | null;
  is_active?: boolean;
  logo_url?: string | null;
  subscribed?: boolean;
  pending_offers_count?: number;
};

export type ManagerPendingOffer = {
  id: string;
  title: string;
  is_standalone?: boolean;
  business_name?: string | null;
};

export type ManagerAccount = {
  id: string;
  name: string;
  email: string;
  shops: Array<{ id: string; name: string; city?: string | null }>;
  pending_offers?: ManagerPendingOffer[];
};

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
