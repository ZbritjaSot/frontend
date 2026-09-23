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
  panelNote,
} from "@/lib/ui";
import { businessFormSchema, type BusinessFormInput } from "@/schemas/business";
import type { Business } from "@/types";

const emptyForm: BusinessFormInput = {
  name: "",
  owner_name: "",
  owner_email: "",
  is_active: true,
};

const rowClass =
  "flex flex-col gap-5 border-b border-line py-5 min-[800px]:flex-row min-[800px]:items-center min-[800px]:justify-between";

const rowActionClass = `${btnGhost} ${btnSm} min-w-[5.5rem] flex-auto min-[800px]:flex-none`;

const checkLabelClass =
  "flex cursor-pointer flex-row items-start gap-3 font-medium text-ink select-none";

const checkTextClass = "min-w-0 flex-1 pt-px leading-[1.4]";

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
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë bizneset.")}
        </p>
        <button className={btnGhost} type="button" onClick={() => refetch()}>
          Provo përsëri
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-5">
        <button className={btnPrimary} type="button" onClick={openCreate}>
          Shto biznes
        </button>
      </div>

      {notice ? <p className={panelNote}>{notice}</p> : null}

      {businesses.length === 0 ? (
        <div className="max-w-[40rem]">
          <p className={panelLead}>Nuk ka biznese ende.</p>
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {businesses.map((business) => (
            <li key={business.id} className={rowClass}>
              <div className="flex min-w-0 gap-5">
                <span className="m-0 text-[1.0625rem] font-semibold">
                  {business.name}
                </span>
                <span className="mt-[0.3rem] text-sm leading-[1.45] text-muted">
                  {business.owner?.name ?? "Pa pronar"}
                  {business.owner?.email ? ` · ${business.owner.email}` : ""}
                </span>
              </div>
              <span
                className={offerStatusClass(
                  business.is_active ? "approved" : "rejected",
                )}
              >
                {business.is_active ? "Aktive" : "Joaktive"}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  className={rowActionClass}
                  type="button"
                  onClick={() => openEdit(business)}
                >
                  Ndrysho
                </button>
                <button
                  className={rowActionClass}
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
              className={btnGhost}
              type="button"
              disabled={createMutation.isPending}
              onClick={() => setCreating(false)}
            >
              Anulo
            </button>
            <button
              className={btnPrimary}
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
          className="flex max-w-[40rem] flex-col gap-5"
          onSubmit={onCreate}
          noValidate
        >
          <p className="text-[0.8125rem] text-muted">
            Një fjalëkalim i rastësishëm i dërgohet pronarit me email. Në
            hyrjen e parë duhet ta ndryshojë.
          </p>
          {formError ? (
            <p className={fieldError} role="alert">
              {formError}
            </p>
          ) : null}
          <label className={fieldLabel}>
            <span>Emri i biznesit</span>
            <input
              className={inputClass}
              value={form.name}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>
          <label className={fieldLabel}>
            <span>Emri i pronarit</span>
            <input
              className={inputClass}
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
          <label className={fieldLabel}>
            <span>Email</span>
            <input
              className={inputClass}
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
          <label className={checkLabelClass}>
            <input
              className={checkInput}
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
              }
            />
            <span className={checkTextClass}>Llogaria aktive</span>
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
              className={btnGhost}
              type="button"
              disabled={updateMutation.isPending}
              onClick={() => setEditing(null)}
            >
              Anulo
            </button>
            <button
              className={btnPrimary}
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
          className="flex max-w-[40rem] flex-col gap-5"
          onSubmit={onEdit}
          noValidate
        >
          {formError ? (
            <p className={fieldError} role="alert">
              {formError}
            </p>
          ) : null}
          <label className={fieldLabel}>
            <span>Emri i biznesit</span>
            <input
              className={inputClass}
              value={editName}
              maxLength={255}
              onChange={(event) => setEditName(event.target.value)}
            />
          </label>
          <label className={checkLabelClass}>
            <input
              className={checkInput}
              type="checkbox"
              checked={editActive}
              onChange={(event) => setEditActive(event.target.checked)}
            />
            <span className={checkTextClass}>Llogaria aktive</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}
