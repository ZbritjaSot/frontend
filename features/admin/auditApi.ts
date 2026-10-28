import { apiFetch } from "@/lib/api";
import type { Paginated } from "@/types";

export type AuditImportance = "high" | "medium" | "low";

export type AuditAction =
  | "business_created"
  | "business_deleted"
  | "email_changed"
  | "password_set"
  | "welcome_resent"
  | "subscription_recorded"
  | "subscription_updated"
  | "branch_approved"
  | "branch_made_main"
  | "offer_approved"
  | "offer_taken_down"
  | "exclusive_on"
  | "exclusive_off"
  | "priority_on"
  | "priority_off"
  | "manager_assigned"
  | "manager_removed"
  | "newsletter_sent"
  | "home_hero_ordered"
  | "home_shops_ordered"
  | "home_flyers_ordered"
  | "home_recommended_ordered"
  | "placement_ordered"
  | "category_renamed"
  | "section_titles";

export type AuditLog = {
  id: string;
  action: AuditAction;
  importance: AuditImportance;
  actor_name: string | null;
  subject: string | null;
  business_id: string | null;
  offer_bundle_id: string | null;
  created_at: string;
};

export function fetchAuditLogs(filter: {
  importance?: AuditImportance | "";
  from?: string;
  to?: string;
  page?: number;
}): Promise<Paginated<AuditLog>> {
  const params = new URLSearchParams();
  if (filter.importance) {
    params.set("importance", filter.importance);
  }
  if (filter.from) {
    params.set("from", filter.from);
  }
  if (filter.to) {
    params.set("to", filter.to);
  }
  if (filter.page && filter.page > 1) {
    params.set("page", String(filter.page));
  }
  const query = params.toString();
  return apiFetch<Paginated<AuditLog>>(`/admin/audit-logs${query ? `?${query}` : ""}`, {
    auth: true,
  });
}
