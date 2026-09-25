"use client";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StoreIcon from "@mui/icons-material/Store";
import Link from "next/link";
import { bizHomeKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { IndicatorLink } from "@/components/ui/IndicatorLink";
import { Spinner } from "@/components/ui/Spinner";
import { useBizOffersByStatus } from "@/hooks/useBizOffers";
import { useBizBusiness, useBizSubscription } from "@/hooks/useBizProfile";
import { formatDateShortSq, formatDateSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { btnPrimary, pageTitle, panelLead } from "@/lib/ui";
import type { BizSubscription } from "@/types";

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

  if (
    businessQuery.isLoading ||
    subscriptionQuery.isLoading ||
    waiting.isLoading
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
    </div>
  );
}
