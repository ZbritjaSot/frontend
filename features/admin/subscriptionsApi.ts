import { apiFetch } from "@/lib/api";
import { fromDateTimeLocalValue } from "@/lib/datetime";
import type { SubscriptionFormInput } from "@/schemas/subscription";
import type { Paginated, Subscription } from "@/types";

type SubscriptionPayload = { data: Subscription };

function toApiBody(input: SubscriptionFormInput) {
  return {
    business_id: input.business_id,
    starts_at: fromDateTimeLocalValue(input.starts_at),
    ends_at: fromDateTimeLocalValue(input.ends_at),
    is_active: input.is_active,
    payment_method: input.payment_method,
    price: input.price,
    payment_note: input.payment_note?.trim() || null,
  };
}

export async function fetchAdminSubscriptions(perPage = 50) {
  return apiFetch<Paginated<Subscription>>(
    `/admin/subscriptions?per_page=${perPage}`,
    { auth: true },
  );
}

export async function createSubscription(input: SubscriptionFormInput) {
  const payload = await apiFetch<SubscriptionPayload>("/admin/subscriptions", {
    method: "POST",
    auth: true,
    body: JSON.stringify(toApiBody(input)),
  });
  return payload.data;
}

export async function updateSubscription(
  id: string,
  data: {
    starts_at?: string;
    ends_at?: string;
    is_active?: boolean;
    payment_method?: string;
    price?: number;
    payment_note?: string | null;
  },
) {
  const body: Record<string, unknown> = {};
  if (data.starts_at !== undefined) {
    body.starts_at = fromDateTimeLocalValue(data.starts_at);
  }
  if (data.ends_at !== undefined) {
    body.ends_at = fromDateTimeLocalValue(data.ends_at);
  }
  if (data.is_active !== undefined) {
    body.is_active = data.is_active;
  }
  if (data.payment_method !== undefined) {
    body.payment_method = data.payment_method;
  }
  if (data.price !== undefined) {
    body.price = data.price;
  }
  if (data.payment_note !== undefined) {
    body.payment_note = data.payment_note?.trim() || null;
  }

  const payload = await apiFetch<SubscriptionPayload>(
    `/admin/subscriptions/${id}`,
    {
      method: "PUT",
      auth: true,
      body: JSON.stringify(body),
    },
  );
  return payload.data;
}
