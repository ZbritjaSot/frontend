"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import { useState } from "react";
import { DashboardKpi } from "@/components/ui/DashboardKpi";
import { Spinner } from "@/components/ui/Spinner";
import { ViewsChart } from "@/features/biz/ViewsChart";
import { useBizOfferViews, useBizOffersByStatus } from "@/hooks/useBizOffers";
import { useBizBusiness, useBizSubscription } from "@/hooks/useBizProfile";
import { formatDateSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { btnGhost, btnPrimary, pageTitle, panelLead } from "@/lib/ui";
import type { BizSubscription, OfferViewRange } from "@/types";

const VIEW_RANGES: OfferViewRange[] = [7, 14, 30];

function subscriptionView(sub: BizSubscription): {
  label: string;
  tone: "accent" | "danger" | "pending";
} {
  if (!sub.is_active) {
    return { label: "Çaktivizuar", tone: "danger" };
  }
  if (sub.is_current) {
    return { label: "Aktive", tone: "accent" };
  }
  if (new Date(sub.ends_at).getTime() <= Date.now()) {
    return { label: "Skaduar", tone: "danger" };
  }
  return { label: "Në pritje", tone: "pending" };
}

export function BizHomePanel() {
  const businessQuery = useBizBusiness();
  const subscriptionQuery = useBizSubscription();
  const waitingFlyers = useBizOffersByStatus("pending", 4, "flyers");
  const waitingOffers = useBizOffersByStatus("pending", 4, "offers");
  const liveFlyers = useBizOffersByStatus("approved", 4, "flyers");
  const liveOffers = useBizOffersByStatus("approved", 4, "offers");
  const [viewRange, setViewRange] = useState<OfferViewRange>(14);
  const [moreViewsOpen, setMoreViewsOpen] = useState(false);
  const views = useBizOfferViews(viewRange);

  if (
    businessQuery.isLoading ||
    subscriptionQuery.isLoading ||
    waitingFlyers.isLoading ||
    waitingOffers.isLoading ||
    (views.isLoading && !views.data)
  ) {
    return (
      <div>
        <h1 className={pageTitle}>Paneli</h1>
        <Spinner label="Duke ngarkuar panelin" />
      </div>
    );
  }

  const business = businessQuery.data;
  const subscription = subscriptionQuery.data ?? null;
  const status = subscription ? subscriptionView(subscription) : null;
  const waitingFlyerTotal =
    waitingFlyers.data?.meta?.total ?? waitingFlyers.data?.data?.length ?? 0;
  const waitingOfferTotal =
    waitingOffers.data?.meta?.total ?? waitingOffers.data?.data?.length ?? 0;
  const viewTotal = views.data?.total ?? 0;
  const topViews = views.data?.top ?? [];
  const leadView = topViews[0];
  const otherViews = topViews.slice(1);
  const viewDays = views.data?.days ?? [];
  const periodViews = viewDays.reduce((sum, day) => sum + day.views, 0);

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className={`${pageTitle} mb-0!`}>Paneli</h1>
          {business?.name ? (
            <p className="m-0 mt-2 truncate text-sm font-semibold text-muted">
              {business.name}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/biz/flyers/new" className={btnPrimary}>
            Fletushkë e re
          </Link>
          <Link href="/biz/offers/new" className={btnGhost}>
            Oferta të reja
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-x-8 gap-y-4 border-b border-line pb-5">
        <DashboardKpi label="Hapje gjithsej" value={viewTotal} detail="Të gjitha ofertat" />
        <DashboardKpi label={`${viewRange} ditët`} value={periodViews} detail="Hapje në këtë periudhë" />
        <DashboardKpi href="/biz/flyers?status=pending" label="Fletushka në pritje" value={waitingFlyerTotal} detail="Dosje me produkte" tone={waitingFlyerTotal > 0 ? "pending" : "ink"} />
        <DashboardKpi href="/biz/offers?status=pending" label="Oferta në pritje" value={waitingOfferTotal} detail="Oferta individuale" tone={waitingOfferTotal > 0 ? "pending" : "ink"} />
        <DashboardKpi href="/biz/flyers?status=approved" label="Fletushka aktive" value={liveFlyers.data?.meta?.total ?? "—"} detail="Të publikuara" tone="accent" />
        <DashboardKpi href="/biz/offers?status=approved" label="Oferta aktive" value={liveOffers.data?.meta?.total ?? "—"} detail="Të publikuara" tone="accent" />
        <DashboardKpi href="/biz/profile?tab=abonimi" label="Abonimi" value={status?.label ?? "Pa abonim"} detail={subscription ? `${formatDateSq(subscription.starts_at)} → ${formatDateSq(subscription.ends_at)}` : "Pa periudhë"} tone={status?.tone === "danger" ? "danger" : "ink"} />
      </div>

      <section className="relative rounded-2xl border border-line">
        <div className="flex items-end justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="m-0 text-base font-bold text-ink">Hapje gjithsej</h2>
            {views.isError ? null : (
              <p className="m-0 mt-1 text-xs font-semibold tracking-[0.08em] text-muted uppercase">
                {viewDays.length} ditët e fundit · {periodViews} hapje
              </p>
            )}
          </div>
          {views.isError ? null : (
            <p className="m-0 text-2xl leading-none font-extrabold tabular-nums">
              {viewTotal}
            </p>
          )}
        </div>
        {views.isError ? (
          <p className={`${panelLead} px-5 pb-5`}>
            {validationMessage(views.error, "Nuk mundëm t’i ngarkojmë hapjet.")}
          </p>
        ) : (
          <div className="border-t border-line">
            <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Periudha">
                {VIEW_RANGES.map((days) => {
                  const selected = viewRange === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      aria-pressed={selected}
                      className={
                        selected
                          ? "min-h-9 cursor-pointer rounded-lg bg-accent px-3 text-sm font-bold text-charcoal"
                          : "min-h-9 cursor-pointer rounded-lg border border-line px-3 text-sm font-bold text-muted hover:text-ink"
                      }
                      onClick={() => setViewRange(days)}
                    >
                      {days} ditë
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={views.isFetching ? "opacity-60 motion-safe:transition-opacity" : ""}>
              <ViewsChart days={viewDays} />
            </div>
            <div className="border-t border-line px-5 py-4">
              <h3 className="m-0 text-sm font-bold text-ink">Më të shikuarat</h3>
              {viewTotal === 0 || !leadView ? (
                <p className="m-0 mt-2 text-sm text-muted">Asnjë hapje ende.</p>
              ) : (
                <div className="mt-2">
                  <div className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
                    <span className="min-w-0 truncate font-semibold">
                      {leadView.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {leadView.view_count}
                    </span>
                  </div>
                  {otherViews.length > 0 ? (
                    <div className="mt-1">
                      <button
                        type="button"
                        aria-expanded={moreViewsOpen}
                        className="inline-flex cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-sm font-semibold text-muted hover:text-ink"
                        onClick={() => setMoreViewsOpen((open) => !open)}
                      >
                        Të tjerat
                        <ExpandMoreIcon
                          fontSize="small"
                          className={moreViewsOpen ? "rotate-180" : ""}
                        />
                      </button>
                      {moreViewsOpen ? (
                        <ul className="m-0 mt-1 list-none p-0">
                          {otherViews.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
                            >
                              <span className="min-w-0 truncate font-semibold">
                                {item.name}
                              </span>
                              <span className="shrink-0 tabular-nums text-muted">
                                {item.view_count}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
