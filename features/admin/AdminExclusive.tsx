"use client";

import { AdminHome } from "@/features/admin/AdminHome";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";
import { pageTitle, panelLead } from "@/lib/ui";

/** Homepage content curation (hero, spotlight, exclusive rail, partners, flyers). */
export function AdminExclusive() {
  return (
    <div>
      <h1 className={pageTitle}>Kryefaqja</h1>
      <p className={`${panelLead} max-w-2xl`}>
        Këtu kuron përmbajtjen e kryefaqes: seksionet, Zbritjet e Ditës, Zbritjet e
        forta, shinën {EXCLUSIVE_LABEL}, partnerët dhe fletushkat.
      </p>
      <AdminHome />
    </div>
  );
}
