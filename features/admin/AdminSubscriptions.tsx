"use client";

import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DashboardKpi } from "@/components/ui/DashboardKpi";
import { adminSubscriptionKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { PosMoneyField } from "@/components/ui/PosMoneyField";
import { SelectField } from "@/components/ui/SelectField";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import {
  useAdminBusinesses,
  useAdminSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
} from "@/hooks/useAdminSubscriptions";
import { defaultSubscriptionWindow } from "@/lib/datetime";
import { formatDateShortSq, formatDateTimeShortSq, formatEurFromCents } from "@/lib/format";
import { validationMessage } from "@/lib/api";
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
import {
  PAYMENT_METHOD_OPTIONS,
  subscriptionFormSchema,
} from "@/schemas/subscription";
import type { PaymentMethod, Subscription } from "@/types";

const textAreaClass = `${inputClass} h-[calc(1.5em*4+1.4rem)] resize-none overflow-y-auto leading-normal`;

const SUBSCRIPTIONS_PAGE_SIZE = 15;

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink hover:border-accent/60 disabled:cursor-wait disabled:opacity-65";

const tableGrid =
  "md:grid md:grid-cols-[minmax(0,1.2fr)_auto_auto_auto_auto_auto] md:gap-x-4";

function paymentMethodLabel(method: PaymentMethod): string {
  return (
    PAYMENT_METHOD_OPTIONS.find((o) => o.value === method)?.label ?? method
  );
}

function statusLabel(sub: Subscription): string {
  if (!sub.is_active) {
    return "Çaktivizuar";
  }
  if (sub.is_current) {
    return "Aktive";
  }
  if (new Date(sub.ends_at).getTime() <= Date.now()) {
    return "Skaduar";
  }
  return "Në pritje";
}

function statusClass(sub: Subscription): string {
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

type BusinessGroup = {
  businessId: string;
  businessName: string;
  latest: Subscription;
  history: Subscription[];
};

function groupByBusiness(subscriptions: Subscription[]): BusinessGroup[] {
  const map = new Map<string, Subscription[]>();

  for (const sub of subscriptions) {
    const key = sub.business_id;
    const list = map.get(key);
    if (list) {
      list.push(sub);
    } else {
      map.set(key, [sub]);
    }
  }

  const groups: BusinessGroup[] = [];
  for (const [businessId, list] of map) {
    const sorted = [...list].sort((a, b) => {
      if (a.is_current !== b.is_current) {
        return a.is_current ? -1 : 1;
      }
      return new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime();
    });
    const latest = sorted[0]!;
    groups.push({
      businessId,
      businessName: latest.business?.name ?? "Biznes",
      latest,
      history: sorted,
    });
  }

  return groups.sort((a, b) =>
    a.businessName.localeCompare(b.businessName, "sq"),
  );
}

function resetFormDefaults() {
  return defaultSubscriptionWindow();
}

export function AdminSubscriptions() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminSubscriptions(q);
  const { data: businessesData, isLoading: businessesLoading } =
    useAdminBusinesses();
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();

  const defaults = resetFormDefaults();
  const [createOpen, setCreateOpen] = useState(false);
  const [businessId, setBusinessId] = useState("");
  const [startsAt, setStartsAt] = useState(defaults.starts_at);
  const [endsAt, setEndsAt] = useState(defaults.ends_at);
  const [isActive, setIsActive] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [priceCents, setPriceCents] = useState(0);
  const [paymentNote, setPaymentNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toToggle, setToToggle] = useState<Subscription | null>(null);
  const [openBusinessId, setOpenBusinessId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = query.trim();
      setQ((current) => {
        if (current !== next) {
          setPage(1);
        }
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const groups = useMemo(
    () => groupByBusiness(data?.data ?? []),
    [data?.data],
  );
  const filteredGroups = statusFilter
    ? groups.filter((group) => statusLabel(group.latest) === statusFilter)
    : groups;
  const loadedNote = (data?.meta?.last_page ?? 1) > 1 ? "Nga të ngarkuarat" : "Gjendja e fundit";
  const lastPage = Math.max(1, Math.ceil(filteredGroups.length / SUBSCRIPTIONS_PAGE_SIZE));
  if (page > lastPage) {
    setPage(lastPage);
  }
  const visibleGroups = filteredGroups.slice(
    (page - 1) * SUBSCRIPTIONS_PAGE_SIZE,
    page * SUBSCRIPTIONS_PAGE_SIZE,
  );

  const businessOptions = useMemo(
    () =>
      (businessesData?.data ?? [])
        .filter((b) => !b.parent_id)
        .map((b) => ({
          value: b.id,
          label: b.is_active ? b.name : `${b.name} (joaktiv)`,
        })),
    [businessesData?.data],
  );

  function resetCreateForm() {
    const next = resetFormDefaults();
    setBusinessId("");
    setStartsAt(next.starts_at);
    setEndsAt(next.ends_at);
    setIsActive(true);
    setPaymentMethod("cash");
    setPriceCents(0);
    setPaymentNote("");
    setFormError(null);
  }

  function closeCreateModal() {
    if (createMutation.isPending) {
      return;
    }
    setCreateOpen(false);
    resetCreateForm();
  }

  const header = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${pageTitle} mb-0!`}>Abonimet</h1>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className={btnPrimary}
            onClick={() => setCreateOpen(true)}
          >
            Regjistro pagesë
          </button>
        </div>
      </div>
      <IndicatorKey items={adminSubscriptionKey} />
      <div className="mb-5 flex flex-wrap gap-x-8 gap-y-4">
        {(
          [
            ["Aktive", "accent"],
            ["Në pritje", "pending"],
            ["Skaduar", "danger"],
            ["Çaktivizuar", "ink"],
          ] as const
        ).map(([label, tone]) => (
          <DashboardKpi
            key={label}
            label={label}
            value={groups.filter((group) => statusLabel(group.latest) === label).length}
            detail={loadedNote}
            tone={tone}
            active={statusFilter === label}
            onClick={() => {
              setStatusFilter((current) => (current === label ? "" : label));
              setPage(1);
            }}
          />
        ))}
      </div>
    </>
  );

  if (isLoading) {
    return (
      <div>
        {header}
        <Spinner label="Duke ngarkuar abonimet" />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {header}
        <div className="max-w-[40rem]">
          <p className={panelLead}>
            {validationMessage(error, "Nuk mundëm t’i ngarkojmë abonimet.")}
          </p>
          <button className={btnGhost} type="button" onClick={() => refetch()}>
            Provo përsëri
          </button>
        </div>
      </div>
    );
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = subscriptionFormSchema.safeParse({
      business_id: businessId,
      starts_at: startsAt,
      ends_at: endsAt,
      is_active: isActive,
      payment_method: paymentMethod,
      price: priceCents,
      payment_note: paymentNote,
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? "Të dhënat nuk janë të vlefshme.",
      );
      return;
    }

    try {
      await createMutation.mutateAsync(parsed.data);
      setOpenBusinessId(parsed.data.business_id);
      setCreateOpen(false);
      resetCreateForm();
    } catch (err) {
      setFormError(validationMessage(err, "Nuk mundëm ta regjistrojmë abonimin."));
    }
  }

  async function confirmToggle() {
    if (!toToggle) {
      return;
    }
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        id: toToggle.id,
        is_active: !toToggle.is_active,
      });
      setToToggle(null);
    } catch (err) {
      setActionError(
        validationMessage(err, "Nuk mundëm ta ndryshojmë statusin."),
      );
      setToToggle(null);
    }
  }

  return (
    <div>
      {header}

      {actionError ? (
        <p className={fieldError} role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-line">
        <TableSearch
          value={query}
          onChange={setQuery}
          label="Kërko biznesin"
        />
        {groups.length === 0 ? (
          <p className="m-0 px-4 py-6 text-sm leading-relaxed text-muted">
            {q === ""
              ? "Nuk ka abonime të regjistruara."
              : "Nuk u gjet asnjë biznes."}
          </p>
        ) : (
          <>
          <div className={`overflow-x-auto ${tableGrid}`}>
            <div className="col-span-6 hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid">
              <span className="whitespace-nowrap">Biznesi</span>
              <span className="whitespace-nowrap">Periudha</span>
              <span className="whitespace-nowrap md:pl-8">Çmimi</span>
              <span className="whitespace-nowrap md:pl-8">Pagesa</span>
              <span className="whitespace-nowrap">Statusi</span>
              <span className="border-l border-line pl-4 whitespace-nowrap">
                Veprimet
              </span>
            </div>
            <ul className="col-span-6 m-0 list-none p-0 md:grid md:grid-cols-subgrid">
              {visibleGroups.map((group) => {
                const open = openBusinessId === group.businessId;
                return (
                  <li
                    key={group.businessId}
                    className="col-span-6 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4"
                  >
                    <p className="m-0 truncate text-base font-semibold">
                      {group.businessName}
                    </p>
                    <p className="m-0 text-sm font-semibold whitespace-nowrap tabular-nums">
                      {formatDateShortSq(group.latest.starts_at)} →{" "}
                      {formatDateShortSq(group.latest.ends_at)}
                    </p>
                    <p className="m-0 text-sm font-semibold whitespace-nowrap tabular-nums md:pl-8">
                      {formatEurFromCents(group.latest.price)}
                    </p>
                    <p className="m-0 text-sm font-semibold whitespace-nowrap md:pl-8">
                      {paymentMethodLabel(group.latest.payment_method)}
                    </p>
                    <span
                      className={`${statusClass(group.latest)} mt-0! w-fit self-center!`}
                    >
                      {statusLabel(group.latest)}
                    </span>
                    <div className="flex items-center gap-1.5 border-l border-line pl-4">
                      <button
                        className={`${rowButton}${open ? " border-accent/60" : ""}`}
                        type="button"
                        aria-expanded={open}
                        aria-label={
                          open
                            ? `Mbyll historinë e ${group.businessName}`
                            : `Shiko historinë e ${group.businessName}`
                        }
                        onClick={() =>
                          setOpenBusinessId((id) =>
                            id === group.businessId ? null : group.businessId,
                          )
                        }
                      >
                        <HistoryOutlinedIcon
                          fontSize="small"
                          className={open ? "text-accent!" : undefined}
                        />
                      </button>
                      <button
                        className={rowButton}
                        type="button"
                        aria-label={
                          group.latest.is_active
                            ? `Çaktivizo ${group.businessName}`
                            : `Aktivizo ${group.businessName}`
                        }
                        disabled={updateMutation.isPending}
                        onClick={() => setToToggle(group.latest)}
                      >
                        {group.latest.is_active ? (
                          <LockOutlinedIcon fontSize="small" />
                        ) : (
                          <LockOpenOutlinedIcon
                            fontSize="small"
                            className="text-accent!"
                          />
                        )}
                      </button>
                    </div>
                    {open ? (
                      <div className="-mx-4 border-t border-line bg-sunken px-4 py-2 md:col-span-6">
                        {group.history.map((sub, index) => (
                          <div
                            key={sub.id}
                            className={`flex flex-col gap-1 py-3${
                              index > 0 ? " border-t border-line/70" : ""
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="m-0 text-sm font-semibold text-ink tabular-nums">
                                {formatDateTimeShortSq(sub.starts_at)} →{" "}
                                {formatDateTimeShortSq(sub.ends_at)}
                                {" · "}
                                {formatEurFromCents(sub.price)}
                                {" · "}
                                {paymentMethodLabel(sub.payment_method)}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                {index === 0 ? (
                                  <span className="text-[0.6875rem] font-bold tracking-wide text-accent uppercase">
                                    Fundit
                                  </span>
                                ) : null}
                                <span
                                  className={`${statusClass(sub)} mt-0! self-center!`}
                                >
                                  {statusLabel(sub)}
                                </span>
                              </div>
                            </div>
                            {sub.payment_note ? (
                              <p className="m-0 text-sm text-muted">
                                {sub.payment_note}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
          <Pagination
            page={page}
            lastPage={lastPage}
            total={groups.length}
            perPage={SUBSCRIPTIONS_PAGE_SIZE}
            onPageChange={setPage}
          />
          </>
        )}
      </div>

      <Modal
        open={createOpen}
        title="Regjistro pagesë"
        size="lg"
        onClose={closeCreateModal}
        footer={
          <>
            <button
              type="button"
              className={btnGhost}
              disabled={createMutation.isPending}
              onClick={closeCreateModal}
            >
              Anulo
            </button>
            <button
              type="submit"
              form="admin-sub-create-form"
              className={btnPrimary}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Duke u ruajtur…" : "Ruaj abonimin"}
            </button>
          </>
        }
      >
        <form
          id="admin-sub-create-form"
          className="flex w-full max-w-none flex-col gap-3"
          onSubmit={onCreate}
          noValidate
        >
          <p className="m-0 text-sm leading-relaxed text-muted">
            Kjo regjistron një pagesë të marrë. Çmimi, metoda dhe shënimi nuk
            shfaqen te dyqani apo te faqja publike.
          </p>
          <dl className="m-0 grid gap-2 rounded-xl border border-line bg-sunken px-4 py-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Dyqani</dt>
              <dd className="m-0 truncate font-semibold">
                {businessOptions.find((option) => option.value === businessId)?.label ?? "Ende pa zgjedhur"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Periudha</dt>
              <dd className="m-0 text-right font-semibold">
                {startsAt || "—"} → {endsAt || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Pagesa</dt>
              <dd className="m-0 font-semibold">
                {paymentMethodLabel(paymentMethod)} · {formatEurFromCents(priceCents)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Statusi</dt>
              <dd className="m-0 font-semibold">{isActive ? "Aktiv" : "Çaktivizuar"}</dd>
            </div>
          </dl>

          {formError ? (
            <p className={fieldError} role="alert">
              {formError}
            </p>
          ) : null}

          <section className="grid gap-3">
            <h3 className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
              Dyqani
            </h3>
            <label className={fieldLabel}>
              <span>Për cilin biznes</span>
              <SelectField
                value={businessId}
                onChange={setBusinessId}
                options={businessOptions}
                placeholder="Zgjidh biznesin"
                disabled={createMutation.isPending || businessesLoading}
                aria-label="Biznesi"
              />
            </label>
          </section>

          <section className="grid gap-3 border-t border-line pt-4">
            <h3 className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
              Periudha
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className={fieldLabel}>
                <span>Fillon</span>
                <DateTimeField
                  value={startsAt}
                  onChange={setStartsAt}
                  disabled={createMutation.isPending}
                  aria-label="Fillon"
                />
              </label>
              <label className={fieldLabel}>
                <span>Mbaron</span>
                <DateTimeField
                  value={endsAt}
                  onChange={setEndsAt}
                  disabled={createMutation.isPending}
                  aria-label="Mbaron"
                />
              </label>
            </div>
          </section>

          <section className="grid gap-3 border-t border-line pt-4">
            <h3 className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
              Pagesa
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className={fieldLabel}>
                <span>Metoda e pagesës</span>
                <SelectField
                  value={paymentMethod}
                  onChange={(value) =>
                    setPaymentMethod(value as PaymentMethod)
                  }
                  options={[...PAYMENT_METHOD_OPTIONS]}
                  disabled={createMutation.isPending}
                  aria-label="Metoda e pagesës"
                />
              </label>
              <label className={fieldLabel}>
                <span>Çmimi (EUR)</span>
                <PosMoneyField
                  valueCents={priceCents}
                  onChangeCents={setPriceCents}
                  disabled={createMutation.isPending}
                  aria-label="Çmimi në euro"
                />
              </label>
            </div>
          </section>

          <section className="grid gap-3 border-t border-line pt-4">
            <h3 className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
              Statusi
            </h3>
            <label className="flex cursor-pointer flex-row items-start gap-3 font-medium text-ink select-none">
              <input
                className={checkInput}
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={createMutation.isPending}
              />
              <span className="min-w-0 flex-1 pt-px leading-[1.4]">
                Aktiv
                <span className="mt-0.5 block text-sm font-normal text-muted">
                  I çaktivizuar fsheh ofertat e dyqanit nga faqja publike.
                </span>
              </span>
            </label>
          </section>

          <section className="grid gap-3 border-t border-line pt-4">
            <h3 className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
              Shënim i brendshëm
            </h3>
            <label className={fieldLabel}>
              <span>Shënim pagese, nëse do</span>
              <textarea
                className={textAreaClass}
                rows={4}
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                disabled={createMutation.isPending}
                maxLength={2000}
                placeholder="p.sh. Pranuar në zyrë më…"
              />
            </label>
          </section>
        </form>
      </Modal>

      <ConfirmModal
        open={toToggle !== null}
        title={toToggle?.is_active ? "Çaktivizo abonimin" : "Aktivizo abonimin"}
        message={
          toToggle
            ? toToggle.is_active
              ? `Çaktivizo abonimin e fundit për “${toToggle.business?.name ?? "biznesin"}”? Ofertat publike do të fshihen nga lista.`
              : `Aktivizo abonimin e fundit për “${toToggle.business?.name ?? "biznesin"}”?`
            : ""
        }
        confirmLabel={toToggle?.is_active ? "Çaktivizo" : "Aktivizo"}
        cancelLabel="Anulo"
        pending={updateMutation.isPending}
        onConfirm={confirmToggle}
        onClose={() => {
          if (!updateMutation.isPending) {
            setToToggle(null);
          }
        }}
      />
    </div>
  );
}
