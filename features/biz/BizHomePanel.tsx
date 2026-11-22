"use client";

import { ExpandMoreIcon } from "@/components/ui/icons";
import Link from "next/link";
import { useState } from "react";
import { DashboardKpi } from "@/components/ui/DashboardKpi";
import { ViewsChart } from "@/features/biz/ViewsChart";
import { useBizOfferViews, useBizOffersByStatus } from "@/hooks/useBizOffers";
import { useBizBusiness, useBizSubscription } from "@/hooks/useBizProfile";
import { formatDateSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { button, offerStatusClass, pageTitle, panelLead } from "@/lib/ui";
import type { BizSubscription, OfferViewRange } from "@/types";

const VIEW_RANGES: OfferViewRange[] = [7, 14, 30];
/** Same window as Subscription::ENDING_SOON_DAYS. */
const ENDING_SOON_MS = 7 * 24 * 60 * 60 * 1000;
const KPI_SHELL =
  "flex min-w-0 flex-col gap-1 border-l border-line px-4 py-1 text-left first:border-l-0 first:pl-0";

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

function subscriptionEndingSoon(sub: BizSubscription): boolean {
  if (!sub.is_current) {
    return false;
  }
  return new Date(sub.ends_at).getTime() <= Date.now() + ENDING_SOON_MS;
}

function statusChip(status: { label: string; tone: "accent" | "danger" | "pending" }): string {
  if (status.label === "Skaduar") {
    return "expired";
  }
  if (status.tone === "danger") {
    return "rejected";
  }
  if (status.tone === "pending") {
    return "pending";
  }
  return "approved";
}

function renewNote(
  sub: BizSubscription | null,
  status: { label: string; tone: "accent" | "danger" | "pending" } | null,
  endingSoon: boolean,
): string | null {
  if (!sub || !status) {
    return "Pa abonim aktiv, ofertat nuk shfaqen publike.";
  }
  if (status.label === "Çaktivizuar") {
    return "Abonimi është çaktivizuar nga administrata. Ofertat nuk shfaqen publike.";
  }
  if (status.label === "Skaduar") {
    return "Ofertat nuk shfaqen publike derisa të rinovohet.";
  }
  if (status.label === "Në pritje") {
    return `Abonimi fillon më ${formatDateSq(sub.starts_at)}. Ofertat nuk shfaqen publike deri atëherë.`;
  }
  if (endingSoon) {
    return `Mbaron më ${formatDateSq(sub.ends_at)}.`;
  }
  return null;
}

function listTotal(data: { meta?: { total?: number }; data?: unknown[] } | undefined): number {
  return data?.meta?.total ?? data?.data?.length ?? 0;
}

function pendingDetail(flyers: number, offers: number): string {
  if (flyers === 0 && offers === 0) {
    return "Asnjë në pritje";
  }
  const flyerLabel = flyers === 1 ? "fletushkë" : "fletushka";
  const offerLabel = offers === 1 ? "ofertë" : "oferta";
  return `${flyers} ${flyerLabel} · ${offers} ${offerLabel}`;
}

function Bone({ className, label }: { className: string; label: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={`motion-safe:animate-pulse rounded-lg bg-sunken ${className}`}
    />
  );
}

function KpiPending({ label }: { label: string }) {
  return (
    <div className={KPI_SHELL} role="status" aria-busy="true" aria-label={`Duke ngarkuar: ${label}`}>
      <span className="h-6 w-12 motion-safe:animate-pulse rounded-lg bg-sunken" />
      <span className="h-4 w-24 motion-safe:animate-pulse rounded-lg bg-sunken" />
      <span className="h-4 w-28 motion-safe:animate-pulse rounded-lg bg-sunken" />
    </div>
  );
}

function KpiValue({
  label,
  detail,
  value,
  pending,
  failed,
  href,
  tone,
}: {
  label: string;
  detail: string;
  value: number;
  pending: boolean;
  failed: boolean;
  href?: string;
  tone?: "ink" | "pending";
}) {
  if (pending) {
    return <KpiPending label={label} />;
  }
  return (
    <DashboardKpi
      label={label}
      detail={failed ? "Nuk u ngarkua" : detail}
      value={failed ? "—" : value}
      href={failed ? undefined : href}
      tone={tone}
    />
  );
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

  const business = businessQuery.data;
  const subscription = subscriptionQuery.isError ? null : (subscriptionQuery.data ?? null);
  const status = subscription ? subscriptionView(subscription) : null;
  const endingSoon = subscription ? subscriptionEndingSoon(subscription) : false;
  const note = subscriptionQuery.isLoading || subscriptionQuery.isError
    ? null
    : renewNote(subscription, status, endingSoon);
  const waitingFlyerTotal = listTotal(waitingFlyers.data);
  const waitingOfferTotal = listTotal(waitingOffers.data);
  const pendingLoading = waitingFlyers.isLoading || waitingOffers.isLoading;
  const pendingFailed = !pendingLoading && (waitingFlyers.isError || waitingOffers.isError);
  const viewTotal = views.data?.total ?? 0;
  const viewsPending = views.isLoading && !views.data;
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
          {businessQuery.isLoading ? (
            <Bone className="mt-2 h-4 w-40" label="Duke ngarkuar dyqanin" />
          ) : businessQuery.isError ? (
            <p className="m-0 mt-2 text-sm font-semibold text-danger" role="alert">
              {validationMessage(businessQuery.error, "Nuk mundëm ta ngarkojmë dyqanin.")}
            </p>
          ) : business?.name ? (
            <p className="m-0 mt-2 truncate text-sm font-semibold text-muted">
              {business.name}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/biz/flyers/new" className={button()}>
            Fletushkë e re
          </Link>
          <Link href="/biz/offers/new" className={button({ variant: "secondary" })}>
            Oferta të reja
          </Link>
        </div>
      </div>

      {subscriptionQuery.isLoading ? (
        <Bone className="mb-8 h-24 w-full rounded-2xl" label="Duke ngarkuar abonimin" />
      ) : (
        <section
          aria-label="Abonimi"
          className={`mb-8 rounded-2xl border px-5 py-4 ${note ? "border-danger bg-elevated" : "border-line bg-elevated"}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="m-0 text-sm font-semibold text-muted">Abonimi</p>
              {subscriptionQuery.isError ? (
                <p className="m-0 mt-2 text-sm font-semibold text-danger" role="alert">
                  {validationMessage(subscriptionQuery.error, "Nuk mundëm ta ngarkojmë abonimin.")}
                </p>
              ) : (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {status ? (
                      <span className={`${offerStatusClass(statusChip(status))} mt-0!`}>
                        {status.label}
                      </span>
                    ) : (
                      <p className="m-0 text-lg font-bold text-ink">Pa abonim</p>
                    )}
                    {subscription ? (
                      <p className="m-0 text-sm font-semibold text-ink">
                        {formatDateSq(subscription.starts_at)} → {formatDateSq(subscription.ends_at)}
                      </p>
                    ) : null}
                  </div>
                  {note ? <p className="m-0 mt-2 text-sm leading-relaxed text-ink">{note}</p> : null}
                </>
              )}
            </div>
            {subscriptionQuery.isError ? (
              <button
                className={button({ variant: "secondary" })}
                type="button"
                onClick={() => subscriptionQuery.refetch()}
              >
                Provo përsëri
              </button>
            ) : note ? (
              <Link href="/biz/profile?tab=abonimi" className={button()}>
                Rinovo
              </Link>
            ) : (
              <Link href="/biz/profile?tab=abonimi" className={button({ variant: "secondary" })}>
                Shiko abonimin
              </Link>
            )}
          </div>
        </section>
      )}

      <div className="mb-8 flex flex-wrap gap-x-8 gap-y-4 border-b border-line pb-5">
        <KpiValue
          label="Në pritje"
          detail={pendingDetail(waitingFlyerTotal, waitingOfferTotal)}
          value={waitingFlyerTotal + waitingOfferTotal}
          pending={pendingLoading}
          failed={pendingFailed}
          href={
            waitingFlyerTotal > 0
              ? "/biz/flyers?status=pending"
              : waitingOfferTotal > 0
                ? "/biz/offers?status=pending"
                : undefined
          }
          tone={!pendingFailed && waitingFlyerTotal + waitingOfferTotal > 0 ? "pending" : "ink"}
        />
        <KpiValue
          label="Oferta aktive"
          detail="Të publikuara"
          value={listTotal(liveOffers.data)}
          pending={liveOffers.isLoading}
          failed={!liveOffers.isLoading && liveOffers.isError}
          href="/biz/offers?status=approved"
        />
        <KpiValue
          label="Fletushka aktive"
          detail="Të publikuara"
          value={listTotal(liveFlyers.data)}
          pending={liveFlyers.isLoading}
          failed={!liveFlyers.isLoading && liveFlyers.isError}
          href="/biz/flyers?status=approved"
        />
        <KpiValue
          label="Hapje gjithsej"
          detail="Të gjitha ofertat"
          value={viewTotal}
          pending={viewsPending}
          failed={views.isError && !views.data}
        />
      </div>

      <section className="relative rounded-2xl border border-line">
        <div className="flex items-end justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="m-0 text-base font-bold text-ink">Hapje gjithsej</h2>
            {views.isError ? null : viewsPending ? (
              <Bone className="mt-2 h-4 w-48" label="Duke ngarkuar periudhën" />
            ) : (
              <p className="m-0 mt-1 text-xs font-semibold tracking-[0.08em] text-muted uppercase">
                {viewDays.length} ditët e fundit · {periodViews} hapje
              </p>
            )}
          </div>
          {views.isError ? null : viewsPending ? (
            <span className="h-8 w-16 motion-safe:animate-pulse rounded-lg bg-sunken" aria-hidden="true" />
          ) : (
            <p className="m-0 text-2xl leading-none font-extrabold tabular-nums">
              {viewTotal}
            </p>
          )}
        </div>
        {views.isError ? (
          <p className={`${panelLead} px-5 pb-5`}>
            {validationMessage(views.error, "Nuk mundëm t’i ngarkojmë hapjet.")}
          </p>
        ) : viewsPending ? (
          <div className="border-t border-line px-5 py-4">
            <Bone className="h-64 w-full rounded-xl" label="Duke ngarkuar hapjet" />
          </div>
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
