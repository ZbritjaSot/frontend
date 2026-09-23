"use client";

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
  PAYMENT_METHOD_OPTIONS,
  subscriptionFormSchema,
} from "@/schemas/subscription";
import type { PaymentMethod, Subscription } from "@/types";

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
      <div className="shell-panel">
        <p className="shell-panel__lead">
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë abonimet.")}
        </p>
        <button className="btn btn--ghost" type="button" onClick={() => refetch()}>
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
    <div className="admin-subs">
      <div className="admin-subs__toolbar">
        <div>
          <p className="admin-subs__lead">
            Lista e bizneseve dhe periudhave të abonimit.
            {expiredCount > 0
              ? ` ${expiredCount} ${expiredCount === 1 ? "abonim i skaduar" : "abonime të skaduara"}.`
              : ""}
          </p>
          {isFetching ? (
            <p className="biz-offers__hint">Duke përditësuar…</p>
          ) : null}
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setCreateOpen(true)}
        >
          Regjistro pagesë
        </button>
      </div>

      {actionError ? (
        <p className="offer-form__error" role="alert">
          {actionError}
        </p>
      ) : null}

      {groups.length === 0 ? (
        <div className="shell-panel">
          <p className="shell-panel__lead">Nuk ka abonime të regjistruara.</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setCreateOpen(true)}
          >
            Regjistro pagesë
          </button>
        </div>
      ) : (
        <ul className="sub-history__list">
          {groups.map((group) => {
            const open = openBusinessId === group.businessId;
            return (
              <li
                key={group.businessId}
                className={`sub-history__item${open ? " is-open" : ""}${
                  statusLabel(group.latest) === "Skaduar" ? " is-expired" : ""
                }`}
              >
                <div className="sub-history__card">
                  <button
                    type="button"
                    className="sub-history__expand"
                    aria-expanded={open}
                    onClick={() =>
                      setOpenBusinessId((id) =>
                        id === group.businessId ? null : group.businessId,
                      )
                    }
                  >
                    <div className="sub-history__title-row">
                      <p className="sub-history__name">{group.businessName}</p>
                      <span
                        className={`biz-offer-row__status ${statusClass(group.latest)}`}
                      >
                        {statusLabel(group.latest)}
                      </span>
                    </div>
                    <p className="sub-history__meta">
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
                    <span className="sub-history__hint">
                      {open ? "Mbyll historinë" : "Shiko historinë"}{" "}
                      <span className="sub-history__chevron" aria-hidden>
                        ▾
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="btn btn--ghost btn--sm sub-history__toggle"
                    disabled={updateMutation.isPending}
                    onClick={() => setToToggle(group.latest)}
                  >
                    {group.latest.is_active ? "Çaktivizo" : "Aktivizo"}
                  </button>
                </div>

                {open ? (
                  <div className="sub-history__body">
                    {group.history.map((sub, index) => (
                      <div key={sub.id} className="sub-history__row">
                        <div className="sub-history__row-top">
                          <p className="sub-history__row-dates">
                            {formatDateTimeShortSq(sub.starts_at)} →{" "}
                            {formatDateTimeShortSq(sub.ends_at)}
                            {" · "}
                            {formatEurFromCents(sub.price)}
                            {" · "}
                            {paymentMethodLabel(sub.payment_method)}
                          </p>
                          <div className="sub-history__row-tags">
                            {index === 0 ? (
                              <span className="sub-history__latest-tag">
                                Fundit
                              </span>
                            ) : null}
                            <span
                              className={`biz-offer-row__status ${statusClass(sub)}`}
                            >
                              {statusLabel(sub)}
                            </span>
                          </div>
                        </div>
                        {sub.payment_note ? (
                          <p className="sub-history__row-note">
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
              className="btn btn--ghost"
              disabled={createMutation.isPending}
              onClick={closeCreateModal}
            >
              Anulo
            </button>
            <button
              type="submit"
              form="admin-sub-create-form"
              className="btn btn--primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Duke u ruajtur…" : "Ruaj abonimin"}
            </button>
          </>
        }
      >
        <form
          id="admin-sub-create-form"
          className="offer-form admin-subs__modal-form"
          onSubmit={onCreate}
          noValidate
        >
          <p className="biz-offers__hint">
            Çmimi, metoda dhe shënimet e pagesës nuk shfaqen te biznesi apo
            publiku.
          </p>

          {formError ? (
            <p className="offer-form__error" role="alert">
              {formError}
            </p>
          ) : null}

          <label className="offer-form__field">
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

          <div className="offer-form__row">
            <label className="offer-form__field">
              <span>Fillon</span>
              <DateTimeField
                value={startsAt}
                onChange={setStartsAt}
                disabled={createMutation.isPending}
                aria-label="Fillon"
              />
            </label>
            <label className="offer-form__field">
              <span>Mbaron</span>
              <DateTimeField
                value={endsAt}
                onChange={setEndsAt}
                disabled={createMutation.isPending}
                aria-label="Mbaron"
              />
            </label>
          </div>

          <div className="offer-form__row">
            <label className="offer-form__field">
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
            <label className="offer-form__field">
              <span>Çmimi (EUR)</span>
              <PosMoneyField
                valueCents={priceCents}
                onChangeCents={setPriceCents}
                disabled={createMutation.isPending}
                aria-label="Çmimi në euro"
              />
            </label>
          </div>

          <label className="offer-form__field offer-form__check">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={createMutation.isPending}
            />
            <span>Aktiv</span>
          </label>

          <label className="offer-form__field">
            <span>Shënim pagese (opsionale)</span>
            <textarea
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
