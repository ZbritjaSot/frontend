import { apiFetch } from "@/lib/api";
import type { CategoryFormInput } from "@/schemas/category";
import type { Category, Paginated } from "@/types";

type CategoryPayload = { data: Category };

function toApiBody(input: CategoryFormInput) {
  const slug = input.slug?.trim();
  return {
    name: input.name.trim(),
    ...(slug ? { slug } : {}),
    icon: input.icon,
    is_active: input.is_active,
  };
}

export const ADMIN_CATEGORIES_PAGE_SIZE = 15;

export async function fetchAdminCategories(
  page = 1,
  perPage = ADMIN_CATEGORIES_PAGE_SIZE,
  q = "",
) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (q.trim() !== "") {
    params.set("q", q.trim());
  }

  return apiFetch<Paginated<Category>>(
    `/admin/categories?${params.toString()}`,
    { auth: true },
  );
}

export async function createCategory(input: CategoryFormInput) {
  const payload = await apiFetch<CategoryPayload>("/admin/categories", {
    method: "POST",
    auth: true,
    body: JSON.stringify(toApiBody(input)),
  });
  return payload.data;
}

export async function reorderCategories(ids: string[]) {
  await apiFetch<void>("/admin/categories/reorder", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ ids }),
  });
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryFormInput> & {
    is_active?: boolean;
    sort_order?: number;
  },
) {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) {
    body.name = input.name.trim();
  }
  if (input.slug !== undefined) {
    const slug = input.slug.trim();
    body.slug = slug || null;
  }
  if (input.sort_order !== undefined) {
    body.sort_order = input.sort_order;
  }
  if (input.icon !== undefined) {
    body.icon = input.icon;
  }
  if (input.is_active !== undefined) {
    body.is_active = input.is_active;
  }

  const payload = await apiFetch<CategoryPayload>(`/admin/categories/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  });
  return payload.data;
}

export async function deleteCategory(id: string) {
  await apiFetch<void>(`/admin/categories/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
