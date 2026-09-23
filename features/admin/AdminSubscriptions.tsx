"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMemo, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { Modal } from "@/components/ui/Modal";
import { PosMoneyField } from "@/components/ui/PosMoneyField";
import { SelectField } from "@/components/ui/SelectField";
import { Spinner } from "@/components/ui/Spinner";
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
  btnSm,
  checkInput,
  fieldError,
  fieldLabel,
  inputClass,
  offerStatusClass,
  panelLead,
} from "@/lib/ui";
import {
  PAYMENT_METHOD_OPTIONS,
  subscriptionFormSchema,
} from "@/schemas/subscription";
import type { PaymentMethod, Subscription } from "@/types";

const textAreaClass = `${inputClass} h-[calc(1.5em*4+1.4rem)] resize-none overflow-y-auto leading-normal`;

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
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.created_at ?? b.starts_at).getTime() -
        new Date(a.created_at ?? a.starts_at).getTime(),
    );
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
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminSubscriptions();
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

  const groups = useMemo(
    () => groupByBusiness(data?.data ?? []),
    [data?.data],
  );
  const expiredCount = groups.filter(
    (group) => statusLabel(group.latest) === "Skaduar",
  ).length;

  const businessOptions = useMemo(
    () =>
      (businessesData?.data ?? []).map((b) => ({
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

  if (isLoading) {
    return <Spinner label="Duke ngarkuar abonimet" />;
  }

  if (isError) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë abonimet.")}
        </p>
        <button className={btnGhost} type="button" onClick={() => refetch()}>
          Provo përsëri
        </button>
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
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <p className="m-0 text-[0.9375rem] leading-snug text-muted">
            Lista e bizneseve dhe periudhave të abonimit.
            {expiredCount > 0
              ? ` ${expiredCount} ${expiredCount === 1 ? "abonim i skaduar" : "abonime të skaduara"}.`
              : ""}
          </p>
          {isFetching ? (
            <p className="m-0 text-[0.8125rem] text-muted">Duke përditësuar…</p>
          ) : null}
        </div>
        <button
          type="button"
          className={btnPrimary}
          onClick={() => setCreateOpen(true)}
        >
          Regjistro pagesë
        </button>
      </div>

      {actionError ? (
        <p className={fieldError} role="alert">
          {actionError}
        </p>
      ) : null}

      {groups.length === 0 ? (
        <div className="max-w-[40rem]">
          <p className={panelLead}>Nuk ka abonime të regjistruara.</p>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => setCreateOpen(true)}
          >
            Regjistro pagesë
          </button>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {groups.map((group) => {
            const open = openBusinessId === group.businessId;
            const expired = statusLabel(group.latest) === "Skaduar";
            return (
              <li
                key={group.businessId}
                className="overflow-hidden rounded-lg border border-line bg-elevated"
              >
                <div
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-3.5 py-3.5${
                    expired
                      ? " shadow-[inset_3px_0_0_var(--color-danger)]"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="group flex min-w-0 cursor-pointer appearance-none flex-col gap-1.5 border-0 bg-transparent p-0 text-left font-[inherit] text-inherit"
                    aria-expanded={open}
                    onClick={() =>
                      setOpenBusinessId((id) =>
                        id === group.businessId ? null : group.businessId,
                      )
                    }
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="m-0 text-base font-bold text-ink">
                        {group.businessName}
                      </p>
                      <span className={statusClass(group.latest)}>
                        {statusLabel(group.latest)}
                      </span>
                    </div>
                    <p className="m-0 text-[0.8125rem] leading-[1.4] text-muted">
                      {formatDateShortSq(group.latest.starts_at)} →{" "}
                      {formatDateShortSq(group.latest.ends_at)}
                      {" · "}
                      {formatEurFromCents(group.latest.price)}
                      {" · "}
                      {paymentMethodLabel(group.latest.payment_method)}
                      {" · "}
                      {group.history.length} abonim
                      {group.history.length === 1 ? "" : "e"}
                    </p>
                    <span className="mt-[0.15rem] inline-flex items-center gap-[0.35rem] text-xs font-semibold text-muted group-hover:text-accent">
                      {open ? "Mbyll historinë" : "Shiko historinë"}
                      <ExpandMoreIcon
                        fontSize="small"
                        className={`transition-transform${open ? " rotate-180" : ""}`}
                      />
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`${btnGhost} ${btnSm} mt-[0.1rem] shrink-0`}
                    disabled={updateMutation.isPending}
                    onClick={() => setToToggle(group.latest)}
                  >
                    {group.latest.is_active ? "Çaktivizo" : "Aktivizo"}
                  </button>
                </div>

                {open ? (
                  <div className="border-t border-line bg-sunken px-2.5 pt-1 pb-2.5">
                    {group.history.map((sub, index) => (
                      <div
                        key={sub.id}
                        className={`flex flex-col gap-1 px-1.5 py-3${
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
                          <div className="flex flex-wrap items-center gap-[0.4rem]">
                            {index === 0 ? (
                              <span className="text-[0.6875rem] font-bold tracking-wide text-accent uppercase">
                                Fundit
                              </span>
                            ) : null}
                            <span className={statusClass(sub)}>
                              {statusLabel(sub)}
                            </span>
                          </div>
                        </div>
                        {sub.payment_note ? (
                          <p className="m-0 text-[0.8125rem] text-muted">
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
      )}

      <Modal
        open={createOpen}
        title="Regjistro pagesë"
        size="md"
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
          <p className="m-0 text-[0.8125rem] text-muted">
            Çmimi, metoda dhe shënimet e pagesës nuk shfaqen te biznesi apo
            publiku.
          </p>

          {formError ? (
            <p className={fieldError} role="alert">
              {formError}
            </p>
          ) : null}

          <label className={fieldLabel}>
            <span>Biznesi</span>
            <SelectField
              value={businessId}
              onChange={setBusinessId}
              options={businessOptions}
              placeholder="Zgjidh biznesin"
              disabled={createMutation.isPending || businessesLoading}
              aria-label="Biznesi"
            />
          </label>

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

          <label className="flex cursor-pointer flex-row items-start gap-3 font-medium text-ink select-none">
            <input
              className={checkInput}
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={createMutation.isPending}
            />
            <span className="min-w-0 flex-1 pt-px leading-[1.4]">Aktiv</span>
          </label>

          <label className={fieldLabel}>
            <span>Shënim pagese (opsionale)</span>
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
