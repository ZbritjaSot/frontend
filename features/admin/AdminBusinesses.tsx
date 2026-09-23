"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { ADMIN_BUSINESSES_PAGE_SIZE } from "@/features/admin/businessesApi";
import {
  useAdminBusinesses,
  useCreateBusiness,
  useUpdateBusiness,
} from "@/hooks/useAdminBusinesses";
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

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink hover:border-accent/60 disabled:cursor-wait disabled:opacity-65";

const checkLabelClass =
  "flex cursor-pointer flex-row items-start gap-3 font-medium text-ink select-none";

const checkTextClass = "min-w-0 flex-1 pt-px leading-[1.4]";

export function AdminBusinesses() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAdminBusinesses(page);
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
      setPage(1);
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
  const lastPage = data?.meta?.last_page;
  const total = data?.meta?.total ?? businesses.length;
  if (lastPage !== undefined && page > lastPage) {
    setPage(lastPage);
  }

  const header = (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className={`${pageTitle} mb-0!`}>Bizneset</h1>
      <button className={btnPrimary} type="button" onClick={openCreate}>
        Shto biznes
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {header}
        <Spinner label="Duke ngarkuar bizneset" />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {header}
        <div className="max-w-[40rem]">
          <p className={panelLead}>
            {validationMessage(error, "Nuk mundëm t’i ngarkojmë bizneset.")}
          </p>
          <button className={btnGhost} type="button" onClick={() => refetch()}>
            Provo përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}

      {notice ? <p className={panelNote}>{notice}</p> : null}

      {businesses.length === 0 ? (
        <div className="max-w-[40rem]">
          <p className={panelLead}>Nuk ka biznese ende.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          <div className="overflow-x-auto md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto_auto] md:gap-x-4">
            <div className="col-span-4 hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid">
              <span className="whitespace-nowrap">Biznesi</span>
              <span className="whitespace-nowrap">Pronari</span>
              <span className="whitespace-nowrap">Statusi</span>
              <span className="border-l border-line pl-4 whitespace-nowrap">
                Veprimet
              </span>
            </div>
            <ul className="col-span-4 m-0 list-none p-0 md:grid md:grid-cols-subgrid">
              {businesses.map((business) => (
                <li
                  key={business.id}
                  className="col-span-4 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4"
                >
                  <p className="m-0 truncate text-base font-semibold">
                    {business.name}
                  </p>
                  <div className="min-w-0">
                    <p className="m-0 truncate text-base font-semibold">
                      {business.owner?.name ?? "Pa pronar"}
                    </p>
                    {business.owner?.email ? (
                      <p className="m-0 truncate text-sm text-muted">
                        {business.owner.email}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`${offerStatusClass(
                      business.is_active ? "approved" : "rejected",
                    )} mt-0! w-fit self-center!`}
                  >
                    {business.is_active ? "Aktive" : "Joaktive"}
                  </span>
                  <div className="flex items-center gap-1.5 border-l border-line pl-4">
                    <button
                      className={rowButton}
                      type="button"
                      aria-label={`Ndrysho ${business.name}`}
                      onClick={() => openEdit(business)}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      className={rowButton}
                      type="button"
                      aria-label={
                        business.is_active
                          ? `Çaktivizo ${business.name}`
                          : `Aktivizo ${business.name}`
                      }
                      disabled={updateMutation.isPending}
                      onClick={() =>
                        updateMutation.mutate({
                          id: business.id,
                          is_active: !business.is_active,
                        })
                      }
                    >
                      {business.is_active ? (
                        <LockOutlinedIcon fontSize="small" />
                      ) : (
                        <LockOpenOutlinedIcon
                          fontSize="small"
                          className="text-accent!"
                        />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Pagination
            page={page}
            lastPage={lastPage ?? 1}
            total={total}
            perPage={ADMIN_BUSINESSES_PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
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
