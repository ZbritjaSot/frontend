"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AdminLiveOffers } from "@/features/admin/AdminLiveOffers";
import { AdminPendingOffers } from "@/features/admin/AdminPendingOffers";
import { pageTitle } from "@/lib/ui";

const tabClass =
  "min-h-10 cursor-pointer rounded-lg border-0 px-3 text-sm font-bold";

export function AdminOffersBoard() {
  const router = useRouter();
  const params = useSearchParams();
  const view = params.get("view") === "aktive" ? "approved" : "pending";

  function setView(next: "pending" | "approved") {
    router.replace(next === "approved" ? "/admin/offers?view=aktive" : "/admin/offers");
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className={`${pageTitle} mb-0!`}>
          {view === "pending" ? "Në pritje" : "Aktive"}
        </h1>
        <div className="flex gap-1">
          <button
            type="button"
            className={`${tabClass} ${view === "pending" ? "bg-accent text-charcoal" : "bg-transparent text-muted hover:text-ink"}`}
            onClick={() => setView("pending")}
          >
            Në pritje
          </button>
          <button
            type="button"
            className={`${tabClass} ${view === "approved" ? "bg-accent text-charcoal" : "bg-transparent text-muted hover:text-ink"}`}
            onClick={() => setView("approved")}
          >
            Aktive
          </button>
        </div>
      </div>
      {view === "pending" ? <AdminPendingOffers /> : <AdminLiveOffers />}
    </>
  );
}
