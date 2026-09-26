import { apiFetch } from "@/lib/api";
import type { Paginated } from "@/types";

export const NEWSLETTER_PAGE_SIZE = 15;

export type NewsletterSubscriber = {
  id: string;
  email: string;
  created_at: string | null;
};

export type NewsletterPick = {
  id: string;
  title: string;
  detail: string;
};

export type NewsletterSubscribers = Paginated<NewsletterSubscriber> & {
  active_count: number;
};

export async function fetchNewsletterSubscribers(page = 1, q = "") {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(NEWSLETTER_PAGE_SIZE),
  });
  const search = q.trim();
  if (search !== "") {
    params.set("q", search);
  }

  return apiFetch<NewsletterSubscribers>(
    `/admin/newsletter/subscribers?${params.toString()}`,
    { auth: true },
  );
}

export async function deleteNewsletterSubscriber(id: string) {
  await apiFetch(`/admin/newsletter/subscribers/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function fetchNewsletterPicks(
  kind: "offer" | "bundle" | "business",
  q = "",
) {
  const params = new URLSearchParams({ kind });
  const search = q.trim();
  if (search !== "") {
    params.set("q", search);
  }
  const payload = await apiFetch<{ data: NewsletterPick[] }>(
    `/admin/newsletter/picks?${params.toString()}`,
    { auth: true },
  );
  return payload.data;
}

export async function sendNewsletter(input: {
  subject: string;
  intro: string;
  offer_ids: string[];
  bundle_ids: string[];
  business_ids: string[];
}) {
  return apiFetch<{ data: { id: string; subject: string; recipient_count: number } }>(
    "/admin/newsletter/sends",
    {
      method: "POST",
      auth: true,
      body: JSON.stringify(input),
    },
  );
}
