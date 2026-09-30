"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import { hasRole } from "@/features/auth/api";
import { ManagerNote } from "@/features/biz/ManagerNote";
import { ManagerShops } from "@/features/biz/ManagerShops";
import { updateBizLinks } from "@/features/biz/api";
import { BranchPanel } from "@/features/branches/BranchPanel";
import { BusinessLinksForm } from "@/features/business/BusinessLinksForm";
import { BizGallery } from "@/features/gallery/BizGallery";
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
  const { data: user } = useMe();
  const manager = !!user && hasRole(user, "manager");
  const businessQuery = useBizBusiness(!manager);
  const subscriptionQuery = useBizSubscription(!manager);
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("tab");
  const section = requested === "abonimi" || requested === "llogaria" || requested === "galeria" || requested === "deget"
    ? requested
    : "biznesi";

  function setSection(next: "biznesi" | "abonimi" | "llogaria" | "galeria" | "deget") {
    router.replace(next === "biznesi" ? "/biz/profile" : `/biz/profile?tab=${next}`);
  }

  if (manager) {
    return <ManagerShops />;
  }

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
  const tabs = [
    ["biznesi", "Biznesi"],
    ["abonimi", "Abonimi"],
    ["llogaria", "Llogaria"],
    ["galeria", "Galeria"],
    ["deget", "Degët"],
  ] as const;

  return (
    <div>
      <section className="border-b border-line pb-5">
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="flex min-w-0 items-center gap-4">
            {business ? (
              <LogoField
                name={business.name}
                logoUrl={business.logo_url}
                readOnly={Boolean(business.parent_id)}
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
              {business ? <ManagerNote business={business} /> : null}
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
      </section>
      <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-line" aria-label="Seksionet e profilit">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`cursor-pointer border-0 border-b-2 bg-transparent px-0 py-3 text-sm font-bold ${
              section === id ? "border-accent text-ink" : "border-transparent text-muted"
            }`}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {section === "biznesi" && business ? (
        <>
          <AddressLink business={business} />
          <BusinessLinksForm
            business={business}
            readOnly={Boolean(business.parent_id)}
            onSave={async (links) => {
              await updateBizLinks(links);
              await queryClient.invalidateQueries({
                queryKey: bizBusinessQueryKey,
              });
            }}
          />
        </>
      ) : null}
      {section === "abonimi" ? (
      <section className="py-5">
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
              {business?.parent_id
                ? " Pagesa regjistrohet te dyqani kryesor. Ky lokacion përdor të njëjtin abonim."
                : ""}
            </p>
          </>
        )}
      </section>
      ) : null}

      {section === "llogaria" ? (
      <section>
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
      ) : null}
      {section === "galeria" ? (
      <section className="py-5">
        <p className={`m-0 ${micro}`}>Galeria</p>
        <p className="m-0 mt-2 mb-4 text-sm leading-relaxed text-muted">
          Fotot që mund të zgjidhen te produktet e një fletushke.
        </p>
        <BizGallery />
      </section>
      ) : null}
      {section === "deget" && business ? <BranchPanel mode="biz" business={business} /> : null}
    </div>
  );
}
