"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Link from "next/link";
import { bizProfileKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { Spinner } from "@/components/ui/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import { LogoField } from "@/features/gallery/LogoField";
import { deleteBizLogo, uploadBizLogo } from "@/features/gallery/api";
import { useMe } from "@/hooks/useAuth";
import {
  bizBusinessQueryKey,
  useBizBusiness,
  useBizSubscription,
} from "@/hooks/useBizProfile";
import { formatDateSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { btnGhost, offerStatusClass, panelLead } from "@/lib/ui";
import type { BizSubscription, Business } from "@/types";

const micro = "text-xs font-bold tracking-[0.08em] text-muted uppercase";

function AddressLink({ business }: { business: Business }) {
  const lines = [business.street, business.village, business.city].filter(
    (part): part is string => Boolean(part),
  );
  const saved = lines.length > 0 ? lines : business.address ? [business.address] : [];

  return (
    <Link
      href="/biz/profile/address"
      aria-label={saved.length > 0 ? "Ndrysho adresën" : "Shto adresën"}
      className="flex items-center justify-between gap-4 border-t border-line px-5 py-4 text-inherit no-underline hover:bg-sunken"
    >
      <span className="grid min-w-0 gap-0.5">
        <span className={micro}>Adresa</span>
        {saved.length > 0 ? (
          saved.map((line, index) => (
            <span key={`${index}-${line}`} className="truncate font-bold">
              {line}
            </span>
          ))
        ) : (
          <span className="font-bold">Shto adresën</span>
        )}
        {business.location_status === "pending" ? (
          <span className="truncate text-sm font-semibold text-muted">
            Në pritje
            {business.pending_address ? ` · ${business.pending_address}` : " · heqje e adresës"}
          </span>
        ) : null}
        {business.location_status === "rejected" ? (
          <span className="truncate text-sm font-semibold text-danger">
            U refuzua
            {business.location_rejection_note
              ? ` · ${business.location_rejection_note}`
              : ""}
          </span>
        ) : null}
      </span>
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-sunken text-ink">
        <EditOutlinedIcon fontSize="small" />
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
      note: "Ofertat e aprovuara mund të shfaqen publike.",
    };
  }
  if (new Date(sub.ends_at).getTime() <= Date.now()) {
    return {
      label: "Skaduar",
      note: "Ofertat nuk shfaqen publike derisa të rinovohet.",
    };
  }
  return {
    label: "Në pritje",
    note: "Abonimi ende nuk ka filluar.",
  };
}

export function BizProfilePanel() {
  const queryClient = useQueryClient();
  const businessQuery = useBizBusiness();
  const subscriptionQuery = useBizSubscription();
  const { data: user } = useMe();

  if (businessQuery.isLoading || subscriptionQuery.isLoading) {
    return <Spinner label="Duke ngarkuar profilin" />;
  }

  if (businessQuery.isError) {
    return (
      <div>
        <p className={panelLead}>
          {validationMessage(
            businessQuery.error,
            "Nuk mundëm ta ngarkojmë profilin.",
          )}
        </p>
        <button
          className={`${btnGhost} mt-4`}
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
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <IndicatorKey items={bizProfileKey} />
      </div>
      <section className="overflow-hidden rounded-2xl border border-line">
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="flex min-w-0 items-center gap-4">
            {business ? (
              <LogoField
                name={business.name}
                logoUrl={business.logo_url}
                onUpload={async (file) => {
                  await uploadBizLogo(file);
                  await queryClient.invalidateQueries({
                    queryKey: bizBusinessQueryKey,
                  });
                }}
                onRemove={async () => {
                  await deleteBizLogo();
                  await queryClient.invalidateQueries({
                    queryKey: bizBusinessQueryKey,
                  });
                }}
              />
            ) : null}
            <div className="min-w-0">
              <p className={`m-0 ${micro}`}>Biznesi</p>
              <h2 className="m-0 mt-1 truncate text-xl font-bold tracking-[-0.02em] text-ink">
                {business?.name}
              </h2>
            </div>
          </div>
          {business ? (
            <span
              className={`${offerStatusClass(business.is_active ? "approved" : "rejected")} mt-0! self-center!`}
            >
              {business.is_active ? "Aktive" : "Joaktive"}
            </span>
          ) : null}
        </div>
        {business ? <AddressLink business={business} /> : null}
      </section>

      <section className="rounded-2xl border border-line p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="m-0 text-lg font-bold text-ink">Abonimi</h2>
          {subscription && status ? (
            <span className={`${statusClass(subscription)} mt-0! self-center!`}>
              {status.label}
            </span>
          ) : null}
        </div>
        {subscriptionQuery.isError ? (
          <p className={`${panelLead} mt-4`}>
            {validationMessage(
              subscriptionQuery.error,
              "Nuk mundëm ta ngarkojmë abonimin.",
            )}
          </p>
        ) : subscription === null ? (
          <>
            <p className="m-0 mt-4 text-lg font-semibold text-ink">
              Nuk ka abonim
            </p>
            <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
              Kontaktoni administratën për pagesë cash. Pa abonim aktiv, ofertat
              nuk shfaqen publike.
            </p>
          </>
        ) : (
          <>
            <p className="m-0 mt-4 text-lg font-semibold text-ink">
              {formatDateSq(subscription.starts_at)} →{" "}
              {formatDateSq(subscription.ends_at)}
            </p>
            <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
              {status?.note}
            </p>
          </>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-line lg:col-span-2">
        <div className="p-5">
          <p className={`m-0 ${micro}`}>Llogaria</p>
          <h2 className="m-0 mt-1 text-xl font-bold tracking-[-0.02em] text-ink">
            {user?.name ?? "—"}
          </h2>
          <p className="m-0 mt-1 text-sm text-muted">{user?.email}</p>
        </div>
        <Link
          href="/biz/profile/password"
          className="flex items-center justify-between gap-4 border-t border-line px-5 py-4 text-inherit no-underline hover:bg-sunken"
        >
          <span className="font-bold">Ndrysho fjalëkalimin</span>
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-sunken text-ink">
            <LockOutlinedIcon fontSize="small" />
          </span>
        </Link>
      </section>
    </div>
  );
}
