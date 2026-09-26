"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import StarIcon from "@mui/icons-material/Star";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { Spinner } from "@/components/ui/Spinner";
import { BranchPanel } from "@/features/branches/BranchPanel";
import { AdminGallery } from "@/features/gallery/AdminGallery";
import { deleteAdminLogo, uploadAdminLogo } from "@/features/gallery/api";
import { LogoField } from "@/features/gallery/LogoField";
import { fetchAdminSubscriptions } from "@/features/admin/subscriptionsApi";
import { setBusinessPassword } from "@/features/admin/businessesApi";
import {
  adminBusinessesQueryKey,
  useAdminBusiness,
  useApproveBusinessLocation,
  useRejectBusinessLocation,
  useUpdateBusiness,
} from "@/hooks/useAdminBusinesses";
import {
  adminSubscriptionsQueryKey,
  useUpdateSubscription,
} from "@/hooks/useAdminSubscriptions";
import { accountEmailMessage, validationMessage } from "@/lib/api";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";
import { toDateTimeLocalValue } from "@/lib/datetime";
import { formatDateSq } from "@/lib/format";
import {
  btnGhost,
  btnPrimary,
  checkInput,
  fieldError,
  fieldLabel,
  inputClass,
  offerStatusClass,
  pageTitle,
  panelLead,
} from "@/lib/ui";
import type { Business, Subscription } from "@/types";

function subscriptionStatus(sub: Subscription): { label: string; note: string } {
  if (!sub.is_active) {
    return {
      label: "Çaktivizuar",
      note: "Abonimi është çaktivizuar. Ofertat nuk shfaqen publike.",
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

function subscriptionTone(sub: Subscription): string {
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

function clockLabel(value: string): string {
  const match = /T(\d{2}):(\d{2})/.exec(value);
  return match ? `${match[1]}:${match[2]}` : "";
}

const micro = "text-xs font-bold tracking-[0.08em] text-muted uppercase";

const checkLabelClass =
  "flex cursor-pointer flex-row items-start gap-3 font-medium text-ink select-none";

function pickSubscription(list: Subscription[]): Subscription | null {
  const current = list.find((item) => item.is_current);
  if (current) {
    return current;
  }
  return (
    [...list].sort(
      (a, b) => new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime(),
    )[0] ?? null
  );
}

function AddressLink({ business }: { business: Business }) {
  const lines = [business.street, business.village, business.city].filter(
    (part): part is string => Boolean(part),
  );
  const saved = lines.length > 0 ? lines : business.address ? [business.address] : [];

  return (
    <Link
      href={`/admin/businesses/${business.id}/address`}
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

export function AdminBusinessProfile({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const businessQuery = useAdminBusiness(id);
  const payerId = businessQuery.data?.parent_id ?? id;
  const subscriptionsQuery = useQuery({
    queryKey: [...adminSubscriptionsQueryKey, "business", payerId],
    queryFn: () => fetchAdminSubscriptions({ businessId: payerId, perPage: 20 }),
    enabled: businessQuery.isSuccess,
  });
  const updateBusiness = useUpdateBusiness();
  const updateSubscription = useUpdateSubscription();
  const approveLocation = useApproveBusinessLocation();
  const rejectLocation = useRejectBusinessLocation();

  const business = businessQuery.data;
  const subscription = useMemo(
    () => pickSubscription(subscriptionsQuery.data?.data ?? []),
    [subscriptionsQuery.data?.data],
  );

  const [name, setName] = useState("");
  const [section, setSection] = useState<"biznesi" | "abonimi" | "llogaria" | "galeria" | "deget">("biznesi");
  const [active, setActive] = useState(true);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [seededId, setSeededId] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [dateSeed, setDateSeed] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [notifyPassword, setNotifyPassword] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const setPasswordMutation = useMutation({
    mutationFn: (input: { password: string; notify: boolean }) =>
      setBusinessPassword(id, input.password, input.notify),
    onSuccess: () => {
      setPassword("");
      setPasswordRepeat("");
      setNotifyPassword(false);
      setPasswordError(null);
      setPasswordConfirmOpen(false);
    },
    onError: (error) => {
      setPasswordConfirmOpen(false);
      setPasswordError(
        validationMessage(error, "Nuk mundëm ta ndryshojmë fjalëkalimin."),
      );
    },
  });

  if (business && seededId !== business.id) {
    setSeededId(business.id);
    setName(business.name);
    setActive(business.is_active);
    setOwnerName(business.owner?.name ?? "");
    setOwnerEmail(business.owner?.email ?? "");
  }

  const dateKey = subscription
    ? `${subscription.id}:${subscription.starts_at}:${subscription.ends_at}`
    : "";
  if (subscription && dateSeed !== dateKey) {
    setDateSeed(dateKey);
    setStartsAt(toDateTimeLocalValue(subscription.starts_at));
    setEndsAt(toDateTimeLocalValue(subscription.ends_at));
  }

  const heading = (
    <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
      <Link
        href="/admin/businesses"
        className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Bizneset</span>
      </Link>
      <div className="col-start-2 mt-3 flex flex-wrap items-center gap-3">
        <h1 className={`${pageTitle} mb-0!`}>
          {business?.name ?? "Profili"}
        </h1>
        {business?.extra_placement ? (
          <StarIcon className="text-accent!" aria-label={EXCLUSIVE_LABEL} />
        ) : null}
        {business ? (
          <Link
            href={`/biznese/${business.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-muted no-underline hover:text-ink"
          >
            Faqja publike
          </Link>
        ) : null}
      </div>
    </div>
  );

  if (businessQuery.isLoading) {
    return (
      <div>
        {heading}
        <Spinner label="Duke ngarkuar profilin" />
      </div>
    );
  }

  if (businessQuery.isError || !business) {
    return (
      <div>
        {heading}
        <p className={panelLead}>
          {validationMessage(
            businessQuery.error,
            "Nuk mundëm ta ngarkojmë profilin.",
          )}
        </p>
      </div>
    );
  }

  const onBusiness = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === "") {
      setBusinessError("Emri i biznesit është i detyrueshëm.");
      return;
    }
    setBusinessError(null);
    try {
      await updateBusiness.mutateAsync({
        id: business.id,
        name: trimmed,
        is_active: active,
      });
    } catch (error) {
      setBusinessError(validationMessage(error, "Nuk mundëm ta ruajmë biznesin."));
    }
  }

  const onAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (ownerEmail.trim() === "") {
      setAccountError("Email-i është i detyrueshëm.");
      return;
    }
    setAccountError(null);
    const saved = (business.owner?.email ?? "").trim().toLowerCase();
    if (ownerEmail.trim().toLowerCase() !== saved) {
      setEmailConfirmOpen(true);
      return;
    }
    await saveAccount();
  };

  const saveAccount = async () => {
    setAccountError(null);
    try {
      await updateBusiness.mutateAsync({
        id: business.id,
        owner_name: ownerName.trim(),
        owner_email: ownerEmail.trim(),
      });
      setEmailConfirmOpen(false);
    } catch (error) {
      setEmailConfirmOpen(false);
      setAccountError(accountEmailMessage(error, "Nuk mundëm ta ruajmë llogarinë."));
    }
  };

  const onPassword = (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      setPasswordError("Fjalëkalimi duhet të ketë të paktën 8 shenja.");
      return;
    }
    if (password !== passwordRepeat) {
      setPasswordError("Fjalëkalimet nuk përputhen.");
      return;
    }
    setPasswordError(null);
    setPasswordConfirmOpen(true);
  };

  const onSubscription = async (event: FormEvent) => {
    event.preventDefault();
    if (!subscription) {
      return;
    }
    setSubscriptionError(null);
    try {
      await updateSubscription.mutateAsync({
        id: subscription.id,
        starts_at: startsAt,
        ends_at: endsAt,
      });
    } catch (error) {
      setSubscriptionError(
        validationMessage(error, "Nuk mundëm t’i ruajmë datat."),
      );
    }
  }

  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-x-5 gap-y-2 border-b border-line" aria-label="Seksionet e profilit">
        {(
          [
            ["biznesi", "Biznesi"],
            ["abonimi", "Abonimi"],
            ["llogaria", "Llogaria"],
            ["galeria", "Galeria"],
            ["deget", "Degët"],
          ] as const
        ).map(([id, label]) => (
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
      <div>
        <section className={section === "biznesi" ? "overflow-hidden" : "hidden"}>
        <section className="overflow-hidden rounded-2xl border border-line">
          <form className="grid gap-4 p-5" onSubmit={onBusiness} noValidate>
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <LogoField
                  name={name || business.name}
                  readOnly={Boolean(business.parent_id)}
                  logoUrl={business.logo_url}
                  onUpload={async (file) => {
                    await uploadAdminLogo(business.id, file);
                    await queryClient.invalidateQueries({
                      queryKey: adminBusinessesQueryKey,
                    });
                  }}
                  onRemove={async () => {
                    await deleteAdminLogo(business.id);
                    await queryClient.invalidateQueries({
                      queryKey: adminBusinessesQueryKey,
                    });
                  }}
                />
                <div className="min-w-0 flex-1">
                  <label className={fieldLabel}>
                    <span className={micro}>Biznesi</span>
                    <input
                      className={inputClass}
                      value={name}
                      maxLength={255}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                </div>
              </div>
              <span
                className={`${offerStatusClass(business.is_active ? "approved" : "rejected")} mt-0! self-center!`}
              >
                {business.is_active ? "Aktive" : "Joaktive"}
              </span>
            </div>
            {businessError ? (
              <p className={fieldError} role="alert">
                {businessError}
              </p>
            ) : null}
            <label className={checkLabelClass}>
              <input
                className={checkInput}
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
              />
              <span>Llogaria aktive</span>
            <p className="m-0 text-sm leading-relaxed text-muted">
              {business.extra_placement
                ? `${EXCLUSIVE_LABEL}. Ylli te lista e bizneseve e ndez dhe e fik për krejt kompaninë.`
                : `Nuk është ${EXCLUSIVE_LABEL}. Ylli te lista e bizneseve e ndez për krejt kompaninë.`}
            </p>
            </label>
            <div className="flex justify-end">
              <button
                className={btnPrimary}
                type="submit"
                disabled={updateBusiness.isPending}
              >
                {updateBusiness.isPending ? "Duke u ruajtur…" : "Ruaj"}
              </button>
            </div>
          </form>
          <AddressLink business={business} />
          {business.location_status === "pending" ? (
            <div className="grid gap-3 border-t border-line px-5 py-4">
              <p className={`m-0 ${micro}`}>Adresë në pritje</p>
              <p className="m-0 font-semibold">
                {business.pending_address ?? "Heqje e adresës"}
              </p>
              {locationError ? (
                <p className={fieldError} role="alert">
                  {locationError}
                </p>
              ) : null}
              <label className={fieldLabel}>
                <span>Arsyeja, nëse e refuzon</span>
                <input
                  className={inputClass}
                  value={rejectNote}
                  maxLength={500}
                  onChange={(event) => setRejectNote(event.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={btnPrimary}
                  type="button"
                  disabled={approveLocation.isPending || rejectLocation.isPending}
                  onClick={() => {
                    setLocationError(null);
                    void approveLocation.mutateAsync(business.id).catch((error: unknown) => {
                      setLocationError(
                        validationMessage(error, "Nuk mundëm ta aprovojmë adresën."),
                      );
                    });
                  }}
                >
                  {approveLocation.isPending ? "Duke aprovuar…" : "Aprovo"}
                </button>
                <button
                  className={btnGhost}
                  type="button"
                  disabled={approveLocation.isPending || rejectLocation.isPending}
                  onClick={() => {
                    const note = rejectNote.trim();
                    if (note === "") {
                      setLocationError("Shkruaj arsyen e refuzimit.");
                      return;
                    }
                    setLocationError(null);
                    void rejectLocation
                      .mutateAsync({ id: business.id, note })
                      .then(() => setRejectNote(""))
                      .catch((error: unknown) => {
                        setLocationError(
                          validationMessage(error, "Nuk mundëm ta refuzojmë adresën."),
                        );
                      });
                  }}
                >
                  {rejectLocation.isPending ? "Duke refuzuar…" : "Refuzo"}
                </button>
              </div>
            </div>
          ) : null}
        </section>
        </section>
        <section className={section === "abonimi" ? "" : "hidden"}>
        <section className="rounded-2xl border border-line">
          <div className="flex items-start justify-between gap-4 p-5">
            <div className="min-w-0">
              <h2 className="m-0 text-lg font-bold text-ink">Abonimi</h2>
              {subscription ? (
                <>
                  <p className="m-0 mt-3 text-lg font-semibold tracking-[-0.02em] text-ink">
                    {formatDateSq(new Date(startsAt || subscription.starts_at))}
                    <span className="px-2 font-normal text-muted">→</span>
                    {formatDateSq(new Date(endsAt || subscription.ends_at))}
                  </p>
                  <p className="m-0 mt-1 text-sm tabular-nums text-muted">
                    {clockLabel(startsAt)}
                    <span className="px-2">→</span>
                    {clockLabel(endsAt)}
                  </p>
                  <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
                    {subscriptionStatus(subscription).note}
                  </p>
                </>
              ) : null}
            </div>
            {subscription ? (
              <span
                className={`${subscriptionTone(subscription)} mt-0! shrink-0 self-start!`}
              >
                {subscriptionStatus(subscription).label}
              </span>
            ) : null}
          </div>
          {subscriptionsQuery.isError ? (
            <p className={`${panelLead} border-t border-line px-5 py-4`}>
              {validationMessage(
                subscriptionsQuery.error,
                "Nuk mundëm ta ngarkojmë abonimin.",
              )}
            </p>
          ) : business.parent_id ? (
            <div className="border-t border-line px-5 py-4">
              {subscription === null ? (
                <p className="m-0 text-lg font-semibold text-ink">Nuk ka abonim</p>
              ) : null}
              <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
                Pagesa regjistrohet te dyqani kryesor. Ky lokacion përdor të njëjtin abonim.
              </p>
              <Link
                href={`/admin/businesses/${business.parent_id}`}
                className="mt-3 inline-block text-sm font-semibold text-ink no-underline hover:text-accent"
              >
                {business.parent?.name ?? "Dyqani kryesor"}
              </Link>
            </div>
          ) : subscription === null ? (
            <div className="border-t border-line px-5 py-4">
              <p className="m-0 text-lg font-semibold text-ink">Nuk ka abonim</p>
              <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
                Regjistro një pagesë te{" "}
                <Link href="/admin/subscriptions" className="font-semibold text-ink">
                  Abonimet
                </Link>
                . Pa abonim aktiv, ofertat nuk shfaqen publike.
              </p>
            </div>
          ) : (
            <form
              className="grid gap-4 border-t border-line p-5"
              onSubmit={onSubscription}
              noValidate
            >
              <label className={fieldLabel}>
                <span>Fillon</span>
                <DateTimeField
                  value={startsAt}
                  onChange={setStartsAt}
                  disabled={updateSubscription.isPending}
                  aria-label="Fillon"
                />
              </label>
              <label className={fieldLabel}>
                <span>Mbaron</span>
                <DateTimeField
                  value={endsAt}
                  onChange={setEndsAt}
                  disabled={updateSubscription.isPending}
                  aria-label="Mbaron"
                />
              </label>
              <p className="m-0 text-sm leading-relaxed text-muted">
                Zgjatja e datave nuk regjistron një pagesë të re. Pagesa e re
                regjistrohet te{" "}
                <Link href="/admin/subscriptions" className="font-semibold text-ink">
                  Abonimet
                </Link>
                .
              </p>
              {subscriptionError ? (
                <p className={fieldError} role="alert">
                  {subscriptionError}
                </p>
              ) : null}
              <div className="flex justify-end">
                <button
                  className={btnPrimary}
                  type="submit"
                  disabled={updateSubscription.isPending}
                >
                  {updateSubscription.isPending ? "Duke u ruajtur…" : "Ruaj datat"}
                </button>
              </div>
            </form>
          )}
        </section>
        </section>
        <section className={section === "llogaria" ? "grid max-w-xl gap-8" : "hidden"}>
          <form className="grid max-w-xl gap-4" onSubmit={onAccount} noValidate>
            <p className={`m-0 ${micro}`}>Llogaria</p>
            {accountError ? (
              <p className={fieldError} role="alert">
                {accountError}
              </p>
            ) : null}
            <label className={fieldLabel}>
              <span>Emri (opsional)</span>
              <input
                className={inputClass}
                value={ownerName}
                maxLength={255}
                onChange={(event) => setOwnerName(event.target.value)}
              />
            </label>
            <label className={fieldLabel}>
              <span>Email</span>
              <input
                className={inputClass}
                type="email"
                value={ownerEmail}
                maxLength={255}
                onChange={(event) => setOwnerEmail(event.target.value)}
              />
            </label>
            <div className="flex justify-end">
              <button
                className={btnPrimary}
                type="submit"
                disabled={updateBusiness.isPending}
              >
                {updateBusiness.isPending ? "Duke u ruajtur…" : "Ruaj llogarinë"}
              </button>
            </div>
          </form>
          <form className="mt-6 grid max-w-xl gap-4 border-t border-line pt-6" onSubmit={onPassword} noValidate>
            <p className={`m-0 ${micro}`}>Fjalëkalimi</p>
            <p className="m-0 text-sm leading-relaxed text-muted">
              Kjo është llogaria kryesore e dyqanit. Fjalëkalimi i ri zëvendëson të
              vjetrin dhe mbyll hyrjet e hapura.
            </p>
            {passwordError ? (
              <p className={fieldError} role="alert">
                {passwordError}
              </p>
            ) : null}
            <label className={fieldLabel}>
              <span>Fjalëkalimi i ri</span>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={password}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <label className={fieldLabel}>
              <span>Përsërite fjalëkalimin</span>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={passwordRepeat}
                minLength={8}
                onChange={(event) => setPasswordRepeat(event.target.value)}
              />
            </label>
            <label className={checkLabelClass}>
              <input
                className={checkInput}
                type="checkbox"
                checked={notifyPassword}
                onChange={(event) => setNotifyPassword(event.target.checked)}
              />
              <span>Dërgo email dyqanit</span>
            </label>
            <div className="flex justify-end">
              <button className={btnPrimary} type="submit">
                Ndrysho fjalëkalimin
              </button>
            </div>
          </form>
        </section>

        <section className={section === "galeria" ? "py-2" : "hidden"}>
          <section className="rounded-2xl border border-line p-5 lg:col-span-2">
            <p className={`m-0 ${micro}`}>Galeria</p>
            <div className="mt-4">
              <AdminGallery businessId={business.id} />
            </div>
          </section>
        </section>
        <div className={section === "deget" ? "" : "hidden"}>
          <BranchPanel mode="admin" business={business} />
        </div>
      </div>
      <ConfirmModal
        open={emailConfirmOpen}
        danger
        title="Ndrysho emailin?"
        message="Ky email bëhet hyrja e dyqanit. Adresa e vjetër nuk hyn më."
        confirmLabel="Ndrysho emailin"
        pending={updateBusiness.isPending}
        onConfirm={() => {
          void saveAccount();
        }}
        onClose={() => setEmailConfirmOpen(false)}
      />
      <ConfirmModal
        open={passwordConfirmOpen}
        danger
        title="Ndrysho fjalëkalimin?"
        message={
          notifyPassword
            ? "Fjalëkalimi i tanishëm ndalon së punuari dhe hyrjet e hapura mbyllen. Dyqani merr një email që fjalëkalimi u ndryshua, pa fjalëkalimin e ri."
            : "Fjalëkalimi i tanishëm ndalon së punuari dhe hyrjet e hapura mbyllen. Dyqani nuk merr email."
        }
        confirmLabel="Ndrysho fjalëkalimin"
        pending={setPasswordMutation.isPending}
        onConfirm={() =>
          setPasswordMutation.mutate({ password, notify: notifyPassword })
        }
        onClose={() => setPasswordConfirmOpen(false)}
      />
    </div>
  );
}
