import { apiFetch } from "@/lib/api";
import type { CityFormInput } from "@/schemas/city";
import type { City, Paginated } from "@/types";

export const ADMIN_CITIES_PAGE_SIZE = 15;

export async function fetchAdminCities(page = 1, perPage = ADMIN_CITIES_PAGE_SIZE, q = "") {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (q.trim() !== "") {
    params.set("q", q.trim());
  }
  return apiFetch<Paginated<City>>(`/admin/cities?${params.toString()}`, { auth: true });
}

export async function createCity(input: CityFormInput) {
  const payload = await apiFetch<{ data: City }>("/admin/cities", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ name: input.name.trim(), is_active: input.is_active }),
  });
  return payload.data;
}

export async function updateCity(id: string, input: Partial<CityFormInput>) {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) {
    body.name = input.name.trim();
  }
  if (input.is_active !== undefined) {
    body.is_active = input.is_active;
  }
  const payload = await apiFetch<{ data: City }>(`/admin/cities/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  });
  return payload.data;
}

export async function reorderCities(ids: string[]) {
  await apiFetch<void>("/admin/cities/reorder", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ ids }),
  });
}

export async function deleteCity(id: string) {
  await apiFetch<void>(`/admin/cities/${id}`, { method: "DELETE", auth: true });
}
