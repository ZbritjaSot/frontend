"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminLiveOffers } from "@/features/admin/AdminLiveOffers";
import { AdminPendingOffers } from "@/features/admin/AdminPendingOffers";
import { adminOfferBoardKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import {
  OfferStatusFilters,
  type OfferListStatus,
} from "@/components/ui/OfferStatusFilters";
import { pageTitle } from "@/lib/ui";

export function AdminOffersBoard() {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("status");
  const view: OfferListStatus =
    requested === "all"
      ? ""
      : requested === "approved" || params.get("view") === "aktive"
        ? "approved"
        : "pending";

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = query.trim();
      setQ((current) => {
        if (current !== next) {
          setPage(1);
        }
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  function setView(next: OfferListStatus) {
    setPage(1);
    setQuery("");
    setQ("");
    router.replace(
      next === ""
        ? "/admin/offers?status=all"
        : next === "approved"
          ? "/admin/offers?status=approved"
          : "/admin/offers",
    );
  }

  return (
    <>
      <h1 className={pageTitle}>Ofertat</h1>
      <OfferStatusFilters value={view} onChange={setView} />
      <IndicatorKey items={adminOfferBoardKey} />
      {view === "pending" ? (
        <AdminPendingOffers
          query={query}
          onQueryChange={setQuery}
          q={q}
          page={page}
          onPageChange={setPage}
        />
      ) : (
        <AdminLiveOffers
          query={query}
          onQueryChange={setQuery}
          q={q}
          page={page}
          onPageChange={setPage}
          scope={view === "approved" ? "approved" : "all"}
        />
      )}
    </>
  );
}
