"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import {
  useAdminBusinesses,
  useCreateBusiness,
  useUpdateBusiness,
} from "@/hooks/useAdminBusinesses";
import { validationMessage } from "@/lib/api";
import { businessFormSchema, type BusinessFormInput } from "@/schemas/business";
import type { Business } from "@/types";

const emptyForm: BusinessFormInput = {
  name: "",
  owner_name: "",
  owner_email: "",
  is_active: true,
};

export function AdminBusinesses() {
  const { data, isLoading, isError, error, refetch } = useAdminBusinesses();
  const createMutation = useCreateBusiness();
  const updateMutation = useUpdateBusiness();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Business | null>(null);
  const [form, setForm] = useState<BusinessFormInput>(emptyForm);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setFormError(null);
    setCreating(true);
  }

  function openEdit(business: Business) {
    setEditing(business);
    setEditName(business.name);
    setEditActive(business.is_active);
    setFormError(null);
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    const parsed = businessFormSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Kontrollo fushat.");
      return;
    }
    setFormError(null);
    try {
      await createMutation.mutateAsync(parsed.data);
      setCreating(false);
      setNotice(
        "Llogaria u krijua. Fjalëkalimi i rastësishëm u dërgua te email-i i pronarit.",
      );
    } catch (submitError) {
      setFormError(
        validationMessage(submitError, "Nuk mundëm ta krijojmë biznesin."),
      );
    }
  }

  async function onEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing) {
      return;
    }
    const name = editName.trim();
    if (name === "") {
      setFormError("Emri i biznesit është i detyrueshëm.");
      return;
    }
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        name,
        is_active: editActive,
      });
      setEditing(null);
    } catch (submitError) {
      setFormError(
        validationMessage(submitError, "Nuk mundëm ta ruajmë biznesin."),
      );
    }
  }

  const businesses = data?.data ?? [];

  if (isLoading) {
    return <Spinner label="Duke ngarkuar bizneset" />;
  }

  if (isError) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë bizneset.")}
        </p>
        <button className="btn btn--ghost" type="button" onClick={() => refetch()}>
          Provo përsëri
        </button>
      </div>
    );
  }

  return (
    <div className="biz-offers">
      <div className="biz-offers__toolbar">
        <button className="btn btn--primary" type="button" onClick={openCreate}>
          Shto biznes
        </button>
      </div>

      {notice ? <p className="shell-panel__note">{notice}</p> : null}

      {businesses.length === 0 ? (
        <div className="shell-panel">
          <p className="shell-panel__lead">Nuk ka biznese ende.</p>
        </div>
      ) : (
        <ul className="biz-offers__list">
          {businesses.map((business) => (
            <li key={business.id} className="biz-offer-row">
              <div className="biz-offer-row__main">
                <span className="biz-offer-row__name">{business.name}</span>
                <span className="biz-offer-row__meta">
                  {business.owner?.name ?? "Pa pronar"}
                  {business.owner?.email ? ` · ${business.owner.email}` : ""}
                </span>
              </div>
              <span
                className={`biz-offer-row__status ${
                  business.is_active
                    ? "biz-offer-row__status--approved"
                    : "biz-offer-row__status--rejected"
                }`}
              >
                {business.is_active ? "Aktive" : "Joaktive"}
              </span>
              <div className="biz-offer-row__actions">
                <button
                  className="btn btn--ghost btn--sm"
                  type="button"
                  onClick={() => openEdit(business)}
                >
                  Ndrysho
                </button>
                <button
                  className="btn btn--ghost btn--sm"
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      id: business.id,
                      is_active: !business.is_active,
                    })
                  }
                >
                  {business.is_active ? "Çaktivizo" : "Aktivizo"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={creating}
        title="Biznes i ri"
        onClose={() => {
          if (!createMutation.isPending) {
            setCreating(false);
          }
        }}
        size="md"
        footer={
          <>
            <button
              className="btn btn--ghost"
              type="button"
              disabled={createMutation.isPending}
              onClick={() => setCreating(false)}
            >
              Anulo
            </button>
            <button
              className="btn btn--primary"
              type="submit"
              form="admin-business-create"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Duke u ruajtur…" : "Krijo llogarinë"}
            </button>
          </>
        }
      >
        <form
          id="admin-business-create"
          className="offer-form"
          onSubmit={onCreate}
          noValidate
        >
          <p className="biz-offers__hint">
            Një fjalëkalim i rastësishëm i dërgohet pronarit me email. Në
            hyrjen e parë duhet ta ndryshojë.
          </p>
          {formError ? (
            <p className="offer-form__error" role="alert">
              {formError}
            </p>
          ) : null}
          <label className="offer-form__field">
            <span>Emri i biznesit</span>
            <input
              value={form.name}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>
          <label className="offer-form__field">
            <span>Emri i pronarit</span>
            <input
              value={form.owner_name}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  owner_name: event.target.value,
                }))
              }
            />
          </label>
          <label className="offer-form__field">
            <span>Email</span>
            <input
              type="email"
              value={form.owner_email}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  owner_email: event.target.value,
                }))
              }
            />
          </label>
          <label className="offer-form__check">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
              }
            />
            <span>Llogaria aktive</span>
          </label>
        </form>
      </Modal>

      <Modal
        open={editing !== null}
        title="Ndrysho biznesin"
        onClose={() => {
          if (!updateMutation.isPending) {
            setEditing(null);
          }
        }}
        footer={
          <>
            <button
              className="btn btn--ghost"
              type="button"
              disabled={updateMutation.isPending}
              onClick={() => setEditing(null)}
            >
              Anulo
            </button>
            <button
              className="btn btn--primary"
              type="submit"
              form="admin-business-edit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Duke u ruajtur…" : "Ruaj"}
            </button>
          </>
        }
      >
        <form
          id="admin-business-edit"
          className="offer-form"
          onSubmit={onEdit}
          noValidate
        >
          {formError ? (
            <p className="offer-form__error" role="alert">
              {formError}
            </p>
          ) : null}
          <label className="offer-form__field">
            <span>Emri i biznesit</span>
            <input
              value={editName}
              maxLength={255}
              onChange={(event) => setEditName(event.target.value)}
            />
          </label>
          <label className="offer-form__check">
            <input
              type="checkbox"
              checked={editActive}
              onChange={(event) => setEditActive(event.target.checked)}
            />
            <span>Llogaria aktive</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}
