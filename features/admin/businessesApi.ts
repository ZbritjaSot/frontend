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

export async function fetchAdminBusinesses(
  page = 1,
  perPage = ADMIN_BUSINESSES_PAGE_SIZE,
) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  return apiFetch<Paginated<Business>>(
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

export async function updateBusiness(
  id: string,
  data: { name?: string; is_active?: boolean },
) {
  const payload = await apiFetch<BusinessPayload>(`/admin/businesses/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
  return payload.data;
}
