"use client";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StoreIcon from "@mui/icons-material/Store";
import Link from "next/link";
import { useState } from "react";
import { bizHomeKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { IndicatorLink } from "@/components/ui/IndicatorLink";
import { Spinner } from "@/components/ui/Spinner";
import { ViewsChart } from "@/features/biz/ViewsChart";
import { useBizOfferViews, useBizOffersByStatus } from "@/hooks/useBizOffers";
import { useBizBusiness, useBizSubscription } from "@/hooks/useBizProfile";
import { formatDateShortSq, formatDateSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { btnPrimary, pageTitle, panelLead } from "@/lib/ui";
import type { BizSubscription, OfferViewRange } from "@/types";

const VIEW_RANGES: OfferViewRange[] = [7, 14, 30];

const PREVIEW = 4;

const seeAll =
  "inline-flex items-center gap-0.5 text-sm font-semibold text-muted no-underline hover:text-accent";

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
  const waiting = useBizOffersByStatus("pending");
  const [viewRange, setViewRange] = useState<OfferViewRange>(14);
  const [moreViewsOpen, setMoreViewsOpen] = useState(false);
  const views = useBizOfferViews(viewRange);

  if (
    businessQuery.isLoading ||
    subscriptionQuery.isLoading ||
    waiting.isLoading ||
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
  const bundles = waiting.data?.data ?? [];
  const waitingTotal = waiting.data?.meta?.total ?? bundles.length;
  const viewTotal = views.data?.total ?? 0;
  const topViews = views.data?.top ?? [];
  const leadView = topViews[0];
  const otherViews = topViews.slice(1);
  const viewDays = views.data?.days ?? [];
  const periodViews = viewDays.reduce((sum, day) => sum + day.views, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className={`${pageTitle} mb-0!`}>Paneli</h1>
          {business?.name ? (
            <p className="m-0 mt-2 truncate text-sm font-semibold text-muted">
              {business.name}
            </p>
          ) : null}
        </div>
        <Link href="/biz/offers/new" className={btnPrimary}>
          Dosje e re
        </Link>
      </div>

      <IndicatorKey items={bizHomeKey(waitingTotal)} />

      <div className="mb-6 grid items-stretch gap-3 sm:grid-cols-2">
        <IndicatorLink
          href="/biz/offers"
          icon={<LocalOfferIcon fontSize="small" />}
          label="Në pritje"
          value={waitingTotal > 99 ? "99+" : waitingTotal}
          tone={waitingTotal > 0 ? "pending" : "ink"}
          badgeLabel={
            waitingTotal === 1 ? "1 në pritje" : `${waitingTotal} në pritje`
          }
        />
        <IndicatorLink
          href="/biz/profile"
          icon={<StoreIcon fontSize="small" />}
          label="Profili"
          value={
            subscriptionQuery.isError ? "—" : (status?.label ?? "Pa abonim")
          }
          hint={
            subscriptionQuery.isError
              ? validationMessage(
                  subscriptionQuery.error,
                  "Nuk mundëm ta ngarkojmë abonimin.",
                )
              : subscription
                ? `${formatDateSq(subscription.starts_at)} → ${formatDateSq(subscription.ends_at)}`
                : "Kontaktoni administratën për pagesë cash."
          }
          tone={
            subscriptionQuery.isError ? "danger" : (status?.tone ?? "ink")
          }
          badgeLabel={status ? `Abonimi: ${status.label}` : "Profili"}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-line">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <h2 className="m-0 text-base font-bold text-ink">Në pritje</h2>
          <Link href="/biz/offers" className={seeAll}>
            Ofertat
            <ChevronRightIcon fontSize="small" />
          </Link>
        </div>
        {waiting.isError ? (
            <p className={`${panelLead} px-5 pb-5`}>
              {validationMessage(
                waiting.error,
                "Nuk mundëm t’i ngarkojmë ofertat.",
              )}
            </p>
          ) : bundles.length === 0 ? (
            <p className="m-0 px-5 pb-5 text-sm text-muted">
              Asnjë ofertë në pritje.
            </p>
          ) : (
            <ul className="m-0 list-none p-0">
              {bundles.slice(0, PREVIEW).map((bundle) => (
                <li key={bundle.id} className="border-t border-line">
                  <Link
                    href={`/biz/offers/${bundle.id}`}
                    className="grid min-w-0 px-5 py-3 text-inherit no-underline hover:bg-sunken"
                  >
                    <span className="truncate font-semibold">
                      {bundle.title}
                    </span>
                    <span className="truncate text-sm text-muted">
                      Skadon {formatDateShortSq(bundle.expires_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
        )}
      </section>

      <section className="relative mt-6 rounded-2xl border border-line">
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
