"use client";

import { AdminHome } from "@/features/admin/AdminHome";
import { pageTitle } from "@/lib/ui";

/** Homepage content: section order, Zbritjet e Ditës, and Zbritjet e Forta. */
export function AdminExclusive() {
  return (
    <div>
      <h1 className={pageTitle}>Kryefaqja</h1>
      <AdminHome />
    </div>
  );
}
