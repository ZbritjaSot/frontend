"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { useBizBusiness, useBizSubscription } from "@/hooks/useBizProfile";
import { formatDateSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import type { BizSubscription, Business } from "@/types";

function AddressLink({ business }: { business: Business }) {
  const lines = [business.street, business.village, business.city].filter(
    (part): part is string => Boolean(part),
  );
  const saved = lines.length > 0 ? lines : business.address ? [business.address] : [];

  return (
    <Link href="/biz/profile/address" className="address-row">
      <span className="address-row__label">Adresa</span>
      {saved.length > 0 ? (
        saved.map((line, index) => (
          <span key={`${index}-${line}`} className="address-row__value">
            {line}
          </span>
        ))
      ) : (
        <span className="address-row__value">Shto adresën</span>
      )}
      <span className="address-row__meta">
        {saved.length > 0 ? "Ndrysho" : "Hap faqen e adresës"}
      </span>
    </Link>
  );
}

function statusClass(sub: BizSubscription): string {
  if (!sub.is_active) {
    return "biz-offer-row__status--rejected";
  }
  if (sub.is_current) {
    return "biz-offer-row__status--approved";
  }
  if (new Date(sub.ends_at).getTime() <= Date.now()) {
    return "biz-offer-row__status--expired";
  }
  return "biz-offer-row__status--pending";
}

function subscriptionStatus(sub: BizSubscription): {
  label: string;
  note: string;
} {
  if (!sub.is_active) {
    return {
      label: "Çaktivizuar",
      note: "Abonimi është çaktivizuar nga administrata. Ofertat nuk shfaqen publike.",
    };
  }
  if (sub.is_current) {
    return {
      label: "Aktive",
      note: "Abonimi është i vlefshëm. Ofertat e aprovuara mund të shfaqen publike.",
    };
  }
  if (new Date(sub.ends_at).getTime() <= Date.now()) {
    return {
      label: "Skaduar",
      note: "Abonimi ka skaduar. Ofertat nuk shfaqen publike derisa të rinovohet.",
    };
  }
  return {
    label: "Në pritje",
    note: "Abonimi ende nuk ka filluar.",
  };
}

export function BizProfilePanel() {
  const businessQuery = useBizBusiness();
  const subscriptionQuery = useBizSubscription();

  if (businessQuery.isLoading || subscriptionQuery.isLoading) {
    return <Spinner label="Duke ngarkuar profilin" />;
  }

  if (businessQuery.isError) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">
          {validationMessage(
            businessQuery.error,
            "Nuk mundëm ta ngarkojmë profilin.",
          )}
        </p>
        <button
          className="btn btn--ghost"
          type="button"
          onClick={() => businessQuery.refetch()}
        >
          Provo përsëri
        </button>
      </div>
    );
  }

  const business = businessQuery.data;
  const subscription = subscriptionQuery.data ?? null;
  const status = subscription ? subscriptionStatus(subscription) : null;

  return (
    <div className="biz-offers" style={{ display: "grid", gap: "1.5rem" }}>
      <div className="shell-panel">
        <h2 className="offer-form__title">Biznesi</h2>
        <p className="shell-panel__lead" style={{ marginTop: "0.75rem" }}>
          {business?.name}
        </p>
        <p className="shell-panel__note">
          Statusi i llogarisë:{" "}
          {business?.is_active ? "aktive" : "joaktive"}
        </p>
        {business ? <AddressLink business={business} /> : null}
      </div>

      <div className="shell-panel">
        <h2 className="offer-form__title">Abonimi</h2>
        {subscriptionQuery.isError ? (
          <p className="shell-panel__lead" style={{ marginTop: "0.75rem" }}>
            {validationMessage(
              subscriptionQuery.error,
              "Nuk mundëm ta ngarkojmë abonimin.",
            )}
          </p>
        ) : subscription === null ? (
          <>
            <p className="shell-panel__lead" style={{ marginTop: "0.75rem" }}>
              Nuk ka abonim të regjistruar.
            </p>
            <p className="shell-panel__note">
              Kontaktoni administratën për pagesë cash. Pa abonim aktiv, ofertat
              nuk shfaqen publike.
            </p>
          </>
        ) : (
          <>
            <p className="shell-panel__lead" style={{ marginTop: "0.75rem" }}>
              <span className={`biz-offer-row__status ${statusClass(subscription)}`}>
                {status?.label}
              </span>
            </p>
            <p className="shell-panel__note">
              {formatDateSq(subscription.starts_at)} →{" "}
              {formatDateSq(subscription.ends_at)}
            </p>
            <p className="shell-panel__note">{status?.note}</p>
          </>
        )}
      </div>
    </div>
  );
}
