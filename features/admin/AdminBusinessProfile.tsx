"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { Spinner } from "@/components/ui/Spinner";
import { BranchPanel } from "@/features/branches/BranchPanel";
import { BusinessLinksForm } from "@/features/business/BusinessLinksForm";
import { AdminBusinessCatalog } from "@/features/admin/AdminBusinessCatalog";
import { MailResends } from "@/features/admin/MailResends";
import { ManagerNote } from "@/features/biz/ManagerNote";
import { AdminGallery } from "@/features/gallery/AdminGallery";
import { deleteAdminLogo, uploadAdminLogo } from "@/features/gallery/api";
import { LogoField } from "@/features/gallery/LogoField";
import {
  ENDING_SOON_LABEL,
  endingSoonClass,
  isEndingSoon,
  isTrialSubscription,
  pickSubscription,
  subscriptionStatusClass,
  subscriptionStatusLabel,
  subscriptionStatusNote,
} from "@/features/admin/subscriptionDisplay";
import { fetchAdminSubscriptions } from "@/features/admin/subscriptionsApi";
import { setBusinessPassword, updateBusiness as saveBusiness } from "@/features/admin/businessesApi";
import {
  adminBusinessesQueryKey,
  useAdminBusiness,
  useApproveBusinessLocation,
  useRejectBusinessLocation,
  useUpdateBusiness,
} from "@/hooks/useAdminBusinesses";
import {
  adminSubscriptionsQueryKey,
  useCreateSubscription,
  useUpdateSubscription,
} from "@/hooks/useAdminSubscriptions";
import { accountEmailMessage, validationMessage } from "@/lib/api";
import { defaultSubscriptionWindow, toDateTimeLocalValue } from "@/lib/datetime";
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
import type { Business } from "@/types";

function clockLabel(value: string): string {
  const match = /T(\d{2}):(\d{2})/.exec(value);
  return match ? `${match[1]}:${match[2]}` : "";
}

const PROFILE_SECTIONS = [
  ["biznesi", "Biznesi"],
  ["abonimi", "Abonimi"],
  ["llogaria", "Llogaria"],
  ["galeria", "Galeria"],
  ["deget", "Degët"],
  ["ofertat", "Ofertat"],
  ["fletushkat", "Fletushkat"],
] as const;

type ProfileSection = (typeof PROFILE_SECTIONS)[number][0];

function isProfileSection(value: string | null): value is ProfileSection {
  return PROFILE_SECTIONS.some(([id]) => id === value);
}

const micro = "text-xs font-bold tracking-[0.08em] text-muted uppercase";

const checkLabelClass =
  "flex cursor-pointer flex-row items-start gap-3 font-medium text-ink select-none";

function AddressLink({ business }: { business: Business }) {
  const lines = [
    business.street,
    business.neighborhood,
    business.village,
    business.municipality,
    business.city,
  ].filter((part): part is string => Boolean(part));
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
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("section");
  const queryClient = useQueryClient();
  const businessQuery = useAdminBusiness(id);
  const payerId = businessQuery.data?.parent_id ?? id;
  const subscriptionsQuery = useQuery({
    queryKey: [...adminSubscriptionsQueryKey, "business", payerId],
    queryFn: () => fetchAdminSubscriptions({ businessId: payerId, perPage: 20 }),
    enabled: businessQuery.isSuccess,
  });
  const updateBusiness = useUpdateBusiness();
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  const approveLocation = useApproveBusinessLocation();
  const rejectLocation = useRejectBusinessLocation();

  const business = businessQuery.data;
  const subscription = useMemo(
    () => pickSubscription(subscriptionsQuery.data?.data ?? []),
    [subscriptionsQuery.data?.data],
  );

  const [name, setName] = useState("");
  const [section, setSection] = useState<ProfileSection>(
    isProfileSection(requested) ? requested : "biznesi",
  );
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
  const [addingTrial, setAddingTrial] = useState(false);
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
    : `new:${payerId}`;
  if (dateSeed !== dateKey) {
    setDateSeed(dateKey);
    if (subscription) {
      setStartsAt(toDateTimeLocalValue(subscription.starts_at));
      setEndsAt(toDateTimeLocalValue(subscription.ends_at));
    } else {
      const window = defaultSubscriptionWindow();
      setStartsAt(window.starts_at);
      setEndsAt(window.ends_at);
    }
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
      {business ? (
        <div className="col-start-2">
          <ManagerNote business={business} />
        </div>
      ) : null}
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

  const savingDates =
    createSubscription.isPending || updateSubscription.isPending;

  const onSubscription = async (event: FormEvent) => {
    event.preventDefault();
    setSubscriptionError(null);
    try {
      if (subscription) {
        await updateSubscription.mutateAsync({
          id: subscription.id,
          starts_at: startsAt,
          ends_at: endsAt,
        });
        return;
      }
      await createSubscription.mutateAsync({
        business_id: business.id,
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: true,
        payment_method: "cash",
        price: 0,
      });
    } catch (error) {
      setSubscriptionError(
        validationMessage(error, "Nuk mundëm t’i ruajmë datat."),
      );
    }
  }

  return (
    <div>
      {heading}
      <nav className="mb-6 flex flex-wrap gap-x-5 gap-y-2 border-b border-line" aria-label="Seksionet e profilit">
        {PROFILE_SECTIONS.map(([sectionId, label]) => (
          <button
            key={sectionId}
            type="button"
            className={`cursor-pointer border-0 border-b-2 bg-transparent px-0 py-3 text-sm font-bold ${
              section === sectionId ? "border-accent text-ink" : "border-transparent text-muted"
            }`}
            onClick={() => {
              setSection(sectionId);
              router.replace(`/admin/businesses/${business.id}?section=${sectionId}`, {
                scroll: false,
              });
            }}
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
          <BusinessLinksForm
            business={business}
            onSave={async (links) => {
              await saveBusiness(business.id, links);
              await queryClient.invalidateQueries({
                queryKey: adminBusinessesQueryKey,
              });
            }}
          />
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
              {subscription && startsAt && endsAt ? (
                <>
                  <p className="m-0 mt-3 text-lg font-semibold tracking-[-0.02em] text-ink">
                    {formatDateSq(new Date(startsAt))}
                    <span className="px-2 font-normal text-muted">→</span>
                    {formatDateSq(new Date(endsAt))}
                  </p>
                  <p className="m-0 mt-1 text-sm tabular-nums text-muted">
                    {clockLabel(startsAt)}
                    <span className="px-2">→</span>
                    {clockLabel(endsAt)}
                  </p>
                  <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
                    {subscriptionStatusNote(subscription)}
                  </p>
                </>
              ) : (
                <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
                  Nuk ka abonim ende. Shto një provë falas për ta aktivizuar dyqanin pa pagesë.
                </p>
              )}
            </div>
            {subscription ? (
              <div className="flex shrink-0 flex-wrap items-start justify-end gap-1.5">
                <span
                  className={`${subscriptionStatusClass(subscription)} mt-0! self-start!`}
                >
                  {subscriptionStatusLabel(subscription)}
                </span>
                {isEndingSoon(subscription) ? (
                  <span className={`${endingSoonClass()} mt-0! self-start!`}>
                    {ENDING_SOON_LABEL}
                  </span>
                ) : null}
              </div>
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
          ) : !subscription && !addingTrial ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-5">
              <p className="m-0 text-sm leading-relaxed text-muted">
                Datat e provës vendosen këtu. Pagesa e parë regjistrohet te{" "}
                <Link href="/admin/subscriptions" className="font-semibold text-ink">
                  Abonimet
                </Link>
                .
              </p>
              <button
                className={btnPrimary}
                type="button"
                onClick={() => setAddingTrial(true)}
              >
                Shto provë falas
              </button>
            </div>
          ) : (
            <form
              className="grid gap-4 border-t border-line p-5"
              onSubmit={onSubscription}
              noValidate
            >
              <div className="grid items-stretch gap-2 sm:grid-cols-2">
                <DateTimeField
                  variant="card"
                  caption="Fillon"
                  value={startsAt}
                  onChange={setStartsAt}
                  disabled={savingDates}
                />
                <DateTimeField
                  variant="card"
                  caption="Mbaron"
                  value={endsAt}
                  onChange={setEndsAt}
                  disabled={savingDates}
                />
              </div>
              <p className="m-0 text-sm leading-relaxed text-muted">
                {subscription && isTrialSubscription(subscription)
                  ? "Mund t’i zgjatësh datat e provës këtu. Kjo nuk regjistron pagesë. Kur dyqani paguan, regjistro pagesën te "
                  : subscription
                    ? "Mund t’i zgjatësh datat këtu, si më parë. Kjo nuk regjistron pagesë të re. Pagesa e re shkon te "
                    : "Kjo është një provë falas, jo një pagesë. Kur dyqani paguan, regjistro pagesën te "}
                <Link href="/admin/subscriptions" className="font-semibold text-ink">
                  Abonimet
                </Link>
                {subscription && !isTrialSubscription(subscription)
                  ? "."
                  : " — prova ndalon."}
              </p>
              {subscriptionError ? (
                <p className={fieldError} role="alert">
                  {subscriptionError}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                {!subscription ? (
                  <button
                    className={btnGhost}
                    type="button"
                    disabled={savingDates}
                    onClick={() => {
                      setAddingTrial(false);
                      setSubscriptionError(null);
                    }}
                  >
                    Anulo
                  </button>
                ) : null}
                <button
                  className={btnPrimary}
                  type="submit"
                  disabled={savingDates}
                >
                  {savingDates
                    ? "Duke u ruajtur…"
                    : subscription
                      ? "Ruaj datat"
                      : "Shto provë falas"}
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
          <div className="border-t border-line pt-6">
            <MailResends
              businessId={business.id}
              templates={[
                "welcome",
                "password_changed",
                "password_reset",
                "subscription_recorded",
              ]}
            />
          </div>
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
        {section === "ofertat" ? (
          <AdminBusinessCatalog businessId={business.id} catalog="offers" />
        ) : null}
        {section === "fletushkat" ? (
          <AdminBusinessCatalog businessId={business.id} catalog="flyers" />
        ) : null}
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
