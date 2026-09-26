import { apiFetch } from "@/lib/api";
import type { Paginated } from "@/types";

export type MailTemplate =
  | "welcome"
  | "password_changed"
  | "password_reset"
  | "subscription_recorded"
  | "approved"
  | "taken_down";

export type MailResend = {
  id: string;
  template: MailTemplate;
  email: string;
  admin_name: string | null;
  business_id: string | null;
  offer_bundle_id: string | null;
  created_at: string;
};

export function fetchMailResends(filter: {
  businessId?: string;
  offerBundleId?: string;
}): Promise<Paginated<MailResend>> {
  const params = new URLSearchParams();
  if (filter.businessId) {
    params.set("business_id", filter.businessId);
  }
  if (filter.offerBundleId) {
    params.set("offer_bundle_id", filter.offerBundleId);
  }
  return apiFetch<Paginated<MailResend>>(`/admin/mail-resends?${params.toString()}`, {
    auth: true,
  });
}

export function resendBusinessMail(businessId: string, template: MailTemplate) {
  return apiFetch<{ data: MailResend }>(`/admin/businesses/${businessId}/resend`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ template }),
  });
}

export function resendOfferMail(offerBundleId: string, template: MailTemplate) {
  return apiFetch<{ data: MailResend }>(`/admin/offer-bundles/${offerBundleId}/resend`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ template }),
  });
}
