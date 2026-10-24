import { hasRole } from "@/features/auth/api";
import { safeNextPath } from "@/lib/safeNextPath";
import type { User } from "@/types";

export function hasDashboardRole(user: User): boolean {
  return hasRole(user, "admin") || hasRole(user, "business") || hasRole(user, "manager");
}

/**
 * Send the signed-in user to their area. `next` is honored only when it
 * belongs to that role — an admin `next` never opens /biz, and vice versa.
 */
export function postLoginPath(user: User, rawNext?: string | null): string {
  if (hasRole(user, "admin")) {
    return safeNextPath(rawNext, "/admin", ["/admin"]);
  }

  if (hasRole(user, "business") || hasRole(user, "manager")) {
    return safeNextPath(rawNext, "/biz", ["/biz"]);
  }

  return "/";
}
