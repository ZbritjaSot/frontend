import { apiFetch } from "@/lib/api";

export type HomeOfferPick = {
  id: string;
  name: string;
  business_name?: string | null;
  bundle_title?: string | null;
  thumb_url?: string | null;
  public: boolean;
};

export type HomeOfferCandidate = {
  id: string;
  name: string;
  business_name?: string | null;
  bundle_title?: string | null;
  city?: string | null;
  thumb_url?: string | null;
};

export type HomeShopPick = {
  id: string;
  name: string;
  city?: string | null;
};

export type HomeFlyerItem = {
  id: string;
  title: string;
  business_name?: string | null;
  city?: string | null;
};

export type HomeCuration = {
  hero: {
    picks: HomeOfferPick[];
    candidates: HomeOfferCandidate[];
  };
  shops: {
    picks: HomeShopPick[];
    candidates: HomeShopPick[];
  };
  flyers: HomeFlyerItem[];
};

export async function fetchAdminHome(q = ""): Promise<HomeCuration> {
  const params = new URLSearchParams();
  if (q !== "") {
    params.set("q", q);
  }
  const query = params.toString();
  const payload = await apiFetch<{ data: HomeCuration }>(
    `/admin/home${query === "" ? "" : `?${query}`}`,
    { auth: true },
  );
  return payload.data;
}

export async function saveAdminHero(offerIds: string[]): Promise<HomeCuration["hero"]> {
  const payload = await apiFetch<{ data: HomeCuration["hero"] }>("/admin/home/hero", {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ offer_ids: offerIds }),
  });
  return payload.data;
}

export async function saveAdminHomeShops(
  businessIds: string[],
): Promise<HomeCuration["shops"]> {
  const payload = await apiFetch<{ data: HomeCuration["shops"] }>("/admin/home/shops", {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ business_ids: businessIds }),
  });
  return payload.data;
}

export type AdminHomeSection = {
  key: string;
  title: string;
  is_visible: boolean;
};

export async function fetchAdminSections(): Promise<AdminHomeSection[]> {
  const payload = await apiFetch<{ data: AdminHomeSection[] }>("/admin/sections", {
    auth: true,
  });
  return payload.data;
}

export async function saveAdminSections(
  sections: AdminHomeSection[],
): Promise<AdminHomeSection[]> {
  const payload = await apiFetch<{ data: AdminHomeSection[] }>("/admin/sections", {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ sections }),
  });
  return payload.data;
}

export async function saveAdminFlyers(bundleIds: string[]): Promise<HomeFlyerItem[]> {
  const payload = await apiFetch<{ data: HomeFlyerItem[] }>("/admin/home/flyers", {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ bundle_ids: bundleIds }),
  });
  return payload.data;
}
