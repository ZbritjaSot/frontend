"use client";

import { AdminHome } from "@/features/admin/AdminHome";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";
import { pageTitle, panelLead } from "@/lib/ui";

/**
 * Homepage curation for hero / shops / flyers.
 * The public Ekskluzive page is automatic and is not curated here.
 */
export function AdminExclusive() {
  return (
    <div>
      <h1 className={pageTitle}>{EXCLUSIVE_LABEL}</h1>
      <p className={`${panelLead} max-w-2xl`}>
        Faqja publike {EXCLUSIVE_LABEL} mbushët vetë me zbritjet më të forta. Këtu
        vendos vetëm kryefaqen: seksionet, heron, dyqanet dhe fletushkat. Dyqanet
        ekskluzive mbeten te Bizneset.
      </p>
      <AdminHome />
    </div>
  );
}
