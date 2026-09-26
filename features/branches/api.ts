import { apiFetch } from "@/lib/api";
import type { Business, CompanyShop, ManagerAccount, Paginated } from "@/types";

type ListPayload<T> = { data: T };

export async function fetchBizShops(): Promise<CompanyShop[]> {
  const payload = await apiFetch<ListPayload<CompanyShop[]>>("/biz/shops", {
    auth: true,
  });
  return payload.data;
}

export async function fetchBizBranches(): Promise<Business[]> {
  const payload = await apiFetch<Paginated<Business>>("/biz/branches", {
    auth: true,
  });
  return payload.data;
}

export async function createBizBranch(input: {
  name: string;
  owner_name?: string;
  owner_email: string;
}): Promise<Business> {
  const payload = await apiFetch<{ data: Business }>("/biz/branches", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
  return payload.data;
}

export async function fetchBizCompanyShops(): Promise<CompanyShop[]> {
  const payload = await apiFetch<ListPayload<CompanyShop[]>>("/biz/company-shops", {
    auth: true,
  });
  return payload.data;
}

export async function fetchAdminBranches(businessId: string): Promise<Business[]> {
  const payload = await apiFetch<Paginated<Business>>(
    `/admin/businesses/${businessId}/branches`,
    { auth: true },
  );
  return payload.data;
}

export async function createAdminBranch(
  businessId: string,
  input: { name: string; owner_name?: string; owner_email: string },
): Promise<Business> {
  const payload = await apiFetch<{ data: Business }>(
    `/admin/businesses/${businessId}/branches`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify(input),
    },
  );
  return payload.data;
}

export async function fetchAdminCompanyShops(businessId: string): Promise<CompanyShop[]> {
  const payload = await apiFetch<ListPayload<CompanyShop[]>>(
    `/admin/businesses/${businessId}/company-shops`,
    { auth: true },
  );
  return payload.data;
}

export const ADMIN_MANAGERS_PAGE_SIZE = 15;

export type AssignableShop = {
  id: string;
  name: string;
  city?: string | null;
};

export async function fetchAdminManagers(
  page = 1,
  q = "",
): Promise<Paginated<ManagerAccount>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(ADMIN_MANAGERS_PAGE_SIZE),
  });
  const search = q.trim();
  if (search !== "") {
    params.set("q", search);
  }

  return apiFetch<Paginated<ManagerAccount>>(
    `/admin/managers?${params.toString()}`,
    { auth: true },
  );
}

export async function fetchAvailableManagerShops(
  managerId?: string,
): Promise<AssignableShop[]> {
  const params = new URLSearchParams();
  if (managerId) {
    params.set("manager", managerId);
  }
  const query = params.toString();
  const payload = await apiFetch<{ data: AssignableShop[] }>(
    `/admin/managers/available-shops${query ? `?${query}` : ""}`,
    { auth: true },
  );
  return payload.data;
}

export async function createAdminManager(input: {
  name: string;
  email: string;
  business_ids: string[];
}): Promise<ManagerAccount> {
  const payload = await apiFetch<{ data: ManagerAccount }>("/admin/managers", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
  return payload.data;
}

export async function updateAdminManager(
  id: string,
  businessIds: string[],
): Promise<ManagerAccount> {
  const payload = await apiFetch<{ data: ManagerAccount }>(`/admin/managers/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ business_ids: businessIds }),
  });
  return payload.data;
}

export async function deleteAdminManager(id: string): Promise<void> {
  await apiFetch<void>(`/admin/managers/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
