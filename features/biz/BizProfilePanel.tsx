"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { useBizBusiness, useBizSubscription } from "@/hooks/useBizProfile";
import { formatDateSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { btnGhost, offerStatusClass, panelLead, panelNote } from "@/lib/ui";
import type { BizSubscription, Business } from "@/types";

function AddressLink({ business }: { business: Business }) {
  const lines = [business.street, business.village, business.city].filter(
    (part): part is string => Boolean(part),
  );
  const saved = lines.length > 0 ? lines : business.address ? [business.address] : [];

  return (
    <Link
      href="/biz/profile/address"
      className="mt-4 grid gap-[0.15rem] rounded-[14px] border border-line px-4 py-[0.9rem] text-inherit no-underline hover:border-accent"
    >
      <span className="text-xs tracking-[0.04em] text-muted uppercase">Adresa</span>
      {saved.length > 0 ? (
        saved.map((line, index) => (
          <span key={`${index}-${line}`} className="font-bold">
            {line}
          </span>
        ))
      ) : (
        <span className="font-bold">Shto adresën</span>
      )}
      <span className="text-xs tracking-[0.04em] text-muted uppercase">
        {saved.length > 0 ? "Ndrysho" : "Hap faqen e adresës"}
      </span>
    </Link>
  );
}

function statusClass(sub: BizSubscription): string {
  if (!sub.is_active) {
    return offerStatusClass("rejected");
  }
  if (sub.is_current) {
    return offerStatusClass("approved");
  }
  if (new Date(sub.ends_at).getTime() <= Date.now()) {
    return offerStatusClass("expired");
  }
  return offerStatusClass("pending");
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
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(
            businessQuery.error,
            "Nuk mundëm ta ngarkojmë profilin.",
          )}
        </p>
        <button
          className={btnGhost}
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
    <div className="grid gap-6">
      <div className="max-w-[40rem]">
        <h2 className="m-0 text-lg font-bold text-ink">Biznesi</h2>
        <p className={panelLead} style={{ marginTop: "0.75rem" }}>
          {business?.name}
        </p>
        <p className={`${panelNote} mb-0`}>
          Statusi i llogarisë:{" "}
          {business?.is_active ? "aktive" : "joaktive"}
        </p>
        {business ? <AddressLink business={business} /> : null}
      </div>

      <div className="max-w-[40rem]">
        <h2 className="m-0 text-lg font-bold text-ink">Abonimi</h2>
        {subscriptionQuery.isError ? (
          <p className={panelLead} style={{ marginTop: "0.75rem" }}>
            {validationMessage(
              subscriptionQuery.error,
              "Nuk mundëm ta ngarkojmë abonimin.",
            )}
          </p>
        ) : subscription === null ? (
          <>
            <p className={panelLead} style={{ marginTop: "0.75rem" }}>
              Nuk ka abonim të regjistruar.
            </p>
            <p className={`${panelNote} mb-0`}>
              Kontaktoni administratën për pagesë cash. Pa abonim aktiv, ofertat
              nuk shfaqen publike.
            </p>
          </>
        ) : (
          <>
            <p className={panelLead} style={{ marginTop: "0.75rem" }}>
              <span className={statusClass(subscription)}>
                {status?.label}
              </span>
            </p>
            <p className={`${panelNote} mb-0`}>
              {formatDateSq(subscription.starts_at)} →{" "}
              {formatDateSq(subscription.ends_at)}
            </p>
            <p className={`${panelNote} mb-0`}>{status?.note}</p>
          </>
        )}
      </div>
    </div>
  );
}
