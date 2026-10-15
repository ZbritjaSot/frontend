import { apiFetch } from "@/lib/api";

export type PlacementKind = "offer" | "flyer";

export type PlacementRef = {
  kind: PlacementKind;
  id: string;
};

export type PlacementPick = PlacementRef & {
  name: string;
  business_name?: string | null;
  bundle_title?: string | null;
  city?: string | null;
  street?: string | null;
  branch?: boolean;
  public: boolean;
};

export type PlacementCandidate = PlacementRef & {
  name: string;
  business_name?: string | null;
  bundle_title?: string | null;
  city?: string | null;
  street?: string | null;
  branch?: boolean;
};

export type PlacementEditor = {
  picks: PlacementPick[];
  candidates: PlacementCandidate[];
};

export function placementKey(item: PlacementRef): string {
  return `${item.kind}:${item.id}`;
}

/**
 * Admin API for ordering the public `/ekskluzive` stream.
 * Deferred: no UI is wired yet; public placement remains automatic (`GET /placement`).
 * See `docs/WEB_MOBILE_IMPROVEMENTS_PLAN.md` Phase 5.
 */
export async function fetchAdminPlacement(): Promise<PlacementEditor> {
  const payload = await apiFetch<{ data: PlacementEditor }>("/admin/placement", {
    auth: true,
  });
  return payload.data;
}

export async function saveAdminPlacement(items: PlacementRef[]): Promise<PlacementEditor> {
  const payload = await apiFetch<{ data: PlacementEditor }>("/admin/placement", {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ items }),
  });
  return payload.data;
}
