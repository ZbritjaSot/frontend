import { apiFetch } from "@/lib/api";
import type { BusinessFormInput } from "@/schemas/business";
import type { Business, Paginated } from "@/types";

type BusinessPayload = { data: Business };

export async function fetchAdminBusinesses(perPage = 50) {
  return apiFetch<Paginated<Business>>(
    `/admin/businesses?per_page=${perPage}`,
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
