"use client";

import { AccountProfilePanel } from "@/features/auth/AccountProfilePanel";
import { panelLead } from "@/lib/ui";

export function AdminProfilePanel() {
  return (
    <div>
      <p className={`${panelLead} mb-6`}>
        Llogaria jote admin. Fjalëkalimin e ndryshon kur të duhet.
      </p>
      <div className="rounded-2xl border border-line">
        <AccountProfilePanel
          passwordHref="/admin/profile/password"
          roleLabel="Administrator"
        />
      </div>
    </div>
  );
}
