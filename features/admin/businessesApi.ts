import { apiFetch } from "@/lib/api";
import type { BusinessFormInput } from "@/schemas/business";
import type { Business, Paginated } from "@/types";

type BusinessPayload = { data: Business };

export const ADMIN_BUSINESSES_PAGE_SIZE = 15;

export async function fetchPendingBusinessLocations(page = 1, perPage = 4) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  return apiFetch<Paginated<Business>>(
    `/admin/businesses/pending-locations?${params.toString()}`,
    { auth: true },
  );
}

export async function fetchAdminBusiness(id: string) {
  const payload = await apiFetch<BusinessPayload>(`/admin/businesses/${id}`, {
    auth: true,
  });
  return payload.data;
}

export type BusinessCounts = {
  active: number;
  inactive: number;
  exclusive: number;
  address: number;
};

export async function fetchAdminBusinesses(
  page = 1,
  perPage = ADMIN_BUSINESSES_PAGE_SIZE,
  q = "",
  scope = "",
) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  const search = q.trim();
  if (search !== "") {
    params.set("q", search);
  }
  if (scope !== "") {
    params.set("scope", scope);
  }

  return apiFetch<Paginated<Business> & { counts?: BusinessCounts }>(
    `/admin/businesses?${params.toString()}`,
    { auth: true },
  );
}

export async function createBusiness(input: BusinessFormInput) {
  const payload = await apiFetch<BusinessPayload>("/admin/businesses", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
  return payload.data;
}

export async function approveBusinessLocation(id: string) {
  const payload = await apiFetch<BusinessPayload>(
    `/admin/businesses/${id}/location/approve`,
    { method: "POST", auth: true },
  );
  return payload.data;
}

export async function rejectBusinessLocation(id: string, note: string) {
  const payload = await apiFetch<BusinessPayload>(
    `/admin/businesses/${id}/location/reject`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({ note }),
    },
  );
  return payload.data;
}

export async function geocodeAdminAddress(address: string) {
  const payload = await apiFetch<{
    data: { latitude: number; longitude: number };
  }>("/admin/businesses/geocode", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ address }),
  });
  return payload.data;
}

export async function updateBusiness(
  id: string,
  data: {
    name?: string;
    is_active?: boolean;
    extra_placement?: boolean;
    street?: string | null;
    village?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    owner_name?: string;
    owner_email?: string;
  },
) {
  const payload = await apiFetch<BusinessPayload>(`/admin/businesses/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
  return payload.data;
}

export async function setBusinessPassword(
  id: string,
  password: string,
  notify = false,
) {
  await apiFetch(`/admin/businesses/${id}/password`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      password,
      password_confirmation: password,
      notify,
    }),
  });
}
