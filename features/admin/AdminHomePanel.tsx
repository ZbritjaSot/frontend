"use client";

import CategoryIcon from "@mui/icons-material/Category";
import PaymentsIcon from "@mui/icons-material/Payments";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import StoreIcon from "@mui/icons-material/Store";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";
import { IndicatorLink } from "@/components/ui/IndicatorLink";
import { Spinner } from "@/components/ui/Spinner";
import { latestExpiredSubscriptions } from "@/features/admin/expiredSubscriptions";
import { usePendingOffers } from "@/hooks/useAdminOffers";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { formatDateShortSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { pageTitle, panelLead } from "@/lib/ui";

const PREVIEW = 4;

const seeAll =
  "inline-flex items-center gap-0.5 text-sm font-semibold text-muted no-underline hover:text-accent";

export function AdminHomePanel() {
  const pending = usePendingOffers(1);
  const subscriptions = useAdminSubscriptions();

  if (pending.isLoading || subscriptions.isLoading) {
    return (
      <div>
        <h1 className={pageTitle}>Paneli</h1>
        <Spinner label="Duke ngarkuar panelin" />
      </div>
    );
  }

  const pendingBundles = pending.data?.data ?? [];
  const pendingTotal = pending.data?.meta?.total ?? pendingBundles.length;
  const expired = latestExpiredSubscriptions(subscriptions.data?.data ?? []);

  return (
    <div>
      <h1 className={pageTitle}>Paneli</h1>
      <div className="mb-6 grid items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <IndicatorLink
          href="/admin/offers"
          icon={<PendingActionsIcon fontSize="small" />}
          label="Në pritje"
          value={pendingTotal > 99 ? "99+" : pendingTotal}
          tone={pendingTotal > 0 ? "pending" : "ink"}
          badgeLabel={
            pendingTotal === 1 ? "1 në pritje" : `${pendingTotal} në pritje`
          }
        />
        <IndicatorLink
          href="/admin/subscriptions"
          icon={<PaymentsIcon fontSize="small" />}
          label="Të skaduara"
          value={expired.length > 99 ? "99+" : expired.length}
          tone={expired.length > 0 ? "danger" : "ink"}
          badgeLabel={
            expired.length === 1
              ? "1 i skaduar"
              : `${expired.length} të skaduara`
          }
        />
        <IndicatorLink
          href="/admin/businesses"
          icon={<StoreIcon fontSize="small" />}
          label="Bizneset"
          badgeLabel="Bizneset"
        />
        <IndicatorLink
          href="/admin/categories"
          icon={<CategoryIcon fontSize="small" />}
          label="Kategoritë"
          badgeLabel="Kategoritë"
        />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-line">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <h2 className="m-0 text-base font-bold text-ink">Në pritje</h2>
            <Link href="/admin/offers" className={seeAll}>
              Të gjitha
              <ChevronRightIcon fontSize="small" />
            </Link>
          </div>
          {pending.isError ? (
            <p className={`${panelLead} px-5 pb-5`}>
              {validationMessage(
                pending.error,
                "Nuk mundëm t’i ngarkojmë ofertat.",
              )}
            </p>
          ) : pendingBundles.length === 0 ? (
            <p className="m-0 px-5 pb-5 text-sm text-muted">
              Nuk ka oferta në pritje.
            </p>
          ) : (
            <ul className="m-0 list-none p-0">
              {pendingBundles.slice(0, PREVIEW).map((bundle) => (
                <li key={bundle.id} className="border-t border-line">
                  <Link
                    href={`/admin/offers/${bundle.id}`}
                    className="grid min-w-0 px-5 py-3 text-inherit no-underline hover:bg-sunken"
                  >
                    <span className="truncate font-semibold">
                      {bundle.title}
                    </span>
                    <span className="truncate text-sm text-muted">
                      {bundle.business?.name ?? "Biznes"}
                      {" · skadon "}
                      {formatDateShortSq(bundle.expires_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-line">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <h2 className="m-0 text-base font-bold text-ink">
              Abonime të skaduara
            </h2>
            <Link href="/admin/subscriptions" className={seeAll}>
              Abonimet
              <ChevronRightIcon fontSize="small" />
            </Link>
          </div>
          {subscriptions.isError ? (
            <p className={`${panelLead} px-5 pb-5`}>
              {validationMessage(
                subscriptions.error,
                "Nuk mundëm t’i ngarkojmë abonimet.",
              )}
            </p>
          ) : expired.length === 0 ? (
            <p className="m-0 px-5 pb-5 text-sm text-muted">
              Asnjë abonim i skaduar.
            </p>
          ) : (
            <ul className="m-0 list-none p-0">
              {expired.slice(0, PREVIEW).map((sub) => (
                <li key={sub.id} className="border-t border-line">
                  <Link
                    href="/admin/subscriptions"
                    className="grid min-w-0 px-5 py-3 text-inherit no-underline hover:bg-sunken"
                  >
                    <span className="truncate font-semibold">
                      {sub.business?.name ?? "Biznes"}
                    </span>
                    <span className="truncate text-sm text-muted">
                      Skadoi {formatDateShortSq(sub.ends_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
