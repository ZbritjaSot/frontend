"use client";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import {
  ADMIN_MANAGERS_PAGE_SIZE,
  createAdminManager,
  deleteAdminManager,
  fetchAdminManagers,
  fetchAvailableManagerShops,
  updateAdminManager,
  type AssignableShop,
} from "@/features/branches/api";
import { useApproveOffer } from "@/hooks/useAdminOffers";
import { validationMessage } from "@/lib/api";
import {
  btnGhost,
  btnPrimary,
  offerStatusClass,
  checkInput,
  fieldError,
  fieldLabel,
  inputClass,
  pageTitle,
  panelLead,
} from "@/lib/ui";
import type { ManagerAccount, ManagerPendingOffer } from "@/types";

const managersKey = ["admin", "managers"] as const;

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink hover:border-accent/60 disabled:cursor-wait disabled:opacity-65";

function managerError(error: unknown, fallback: string): string {
  const message = validationMessage(error, fallback);
  if (message === "This shop already has a manager.") {
    return "Ky dyqan ka tashmë një menaxher.";
  }
  if (message === "Assign main shops only.") {
    return "Zgjidh vetëm dyqane kryesore.";
  }
  if (message === "This email is already taken.") {
    return "Ky email është i zënë.";
  }
  if (message === "Approve the waiting flyers before deleting this account.") {
    return "Aprovoji fletushkat në pritje para se ta fshish llogarinë.";
  }
  return message;
}

export function AdminManagers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ManagerAccount | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ManagerAccount | null>(null);
  const [approving, setApproving] = useState<ManagerPendingOffer | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const managers = useQuery({
    queryKey: [...managersKey, page, q],
    queryFn: () => fetchAdminManagers(page, q),
  });

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

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: managersKey });
  }

  const approve = useApproveOffer();
  const remove = useMutation({
    mutationFn: (id: string) => deleteAdminManager(id),
    onSuccess: async (_data, id) => {
      if (editing?.id === id) {
        setEditing(null);
      }
      setPendingDelete(null);
      await refresh();
    },
  });

  const rows = managers.data?.data ?? [];
  const lastPage = managers.data?.meta?.last_page;
  const total = managers.data?.meta?.total ?? rows.length;
  if (lastPage !== undefined && page > lastPage) {
    setPage(lastPage);
  }

  const header = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <h1 className={`${pageTitle} mb-0!`}>Menaxherët</h1>
      <button className={btnPrimary} type="button" onClick={() => setCreating(true)}>
        Shto menaxher
      </button>
    </div>
  );

  return (
    <div>
      {header}
      <p className={`${panelLead} -mt-2 mb-4`}>
        Çdo dyqan i caktohet një menaxheri. Fletushkat në pritje shfaqen këtu, jo te
        lista jote. Aprovoji ose ndryshoji para se ta fshish llogarinë.
      </p>

      {managers.isLoading ? (
        <Spinner label="Duke ngarkuar menaxherët" />
      ) : managers.isError ? (
        <div className="max-w-[40rem]">
          <p className={panelLead}>
            {validationMessage(managers.error, "Nuk mundëm t’i ngarkojmë menaxherët.")}
          </p>
          <button className={btnGhost} type="button" onClick={() => managers.refetch()}>
            Provo përsëri
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          <TableSearch
            value={query}
            onChange={setQuery}
            label="Kërko emrin, emailin ose dyqanin"
          />
          {rows.length === 0 ? (
            <p className="m-0 px-4 py-6 text-sm leading-relaxed text-muted">
              {q === "" ? "Ende pa menaxherë." : "Nuk u gjet asnjë menaxher."}
            </p>
          ) : (
            <div className="overflow-x-auto md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_auto] md:gap-x-4">
              <div className="col-span-4 hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid">
                <span>Menaxheri</span>
                <span>Email</span>
                <span>Dyqanet</span>
                <span className="border-l border-line pl-4">Veprimet</span>
              </div>
              <ul className="col-span-4 m-0 list-none p-0 md:grid md:grid-cols-subgrid">
                {rows.map((manager) => {
                  const waiting = manager.pending_offers ?? [];
                  return (
                    <li
                      key={manager.id}
                      className="col-span-4 border-b border-line last:border-b-0 md:grid md:grid-cols-subgrid"
                    >
                      <div className="col-span-4 grid items-center gap-3 px-4 py-3 md:grid-cols-subgrid md:gap-x-4">
                        <p className="m-0 truncate text-base font-semibold">
                          {manager.name || "Pa emër"}
                        </p>
                        <p className="m-0 truncate text-sm text-muted">{manager.email}</p>
                        <div className="flex min-w-0 flex-wrap gap-1.5">
                          {manager.shops.map((shop) => (
                            <span
                              key={shop.id}
                              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-sunken px-2.5 py-1 text-sm font-semibold text-ink"
                            >
                              <span className="truncate">{shop.name}</span>
                              {shop.city ? (
                                <span className="shrink-0 font-medium text-muted">{shop.city}</span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 border-l border-line pl-4">
                          <button
                            className={rowButton}
                            type="button"
                            aria-label={`Ndrysho dyqanet e ${manager.name || manager.email}`}
                            onClick={() => setEditing(manager)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </button>
                          <button
                            className={rowButton}
                            type="button"
                            disabled={waiting.length > 0 || remove.isPending}
                            aria-label={
                              waiting.length > 0
                                ? `Aprovoji fletushkat e ${manager.name || manager.email} para fshirjes`
                                : `Fshi ${manager.name || manager.email}`
                            }
                            onClick={() => setPendingDelete(manager)}
                          >
                            <DeleteOutlinedIcon fontSize="small" className="text-danger!" />
                          </button>
                        </div>
                      </div>
                      {waiting.length > 0 ? (
                        <ul className="col-span-4 m-0 list-none border-t border-line bg-sunken/50 p-0">
                          {waiting.map((offer) => (
                            <li
                              key={offer.id}
                              className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-2.5 last:border-b-0"
                            >
                              <span className={offerStatusClass("pending")}>Në pritje</span>
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                                {offer.title}
                                {offer.business_name ? (
                                  <span className="font-medium text-muted">
                                    {" "}
                                    · {offer.business_name}
                                  </span>
                                ) : null}
                              </span>
                              <Link
                                href={`/admin/offers/${offer.id}/edit`}
                                className="text-sm font-semibold text-ink no-underline hover:text-accent"
                              >
                                Ndrysho
                              </Link>
                              <button
                                className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-accent hover:underline"
                                type="button"
                                onClick={() => setApproving(offer)}
                              >
                                Aprovo
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {rows.length > 0 ? (
            <Pagination
              page={page}
              lastPage={lastPage ?? 1}
              total={total}
              perPage={ADMIN_MANAGERS_PAGE_SIZE}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      )}

      <ManagerFormModal
        key={creating ? "create-open" : "create-closed"}
        open={creating}
        title="Menaxher i ri"
        managerId={undefined}
        initialName=""
        initialEmail=""
        initialShops={[]}
        submitLabel="Krijo llogarinë"
        pendingLabel="Duke krijuar…"
        onClose={() => setCreating(false)}
        onSubmit={async (input) => {
          await createAdminManager({
            name: input.name,
            email: input.email,
            business_ids: input.businessIds,
          });
          setPage(1);
          setCreatedAccount({ name: input.name, email: input.email });
          await refresh();
        }}
      />

      <ManagerFormModal
        key={editing?.id ?? "edit-closed"}
        open={editing !== null}
        title="Dyqanet e menaxherit"
        managerId={editing?.id}
        initialName={editing?.name ?? ""}
        initialEmail={editing?.email ?? ""}
        initialShops={editing?.shops.map((shop) => shop.id) ?? []}
        lockAccount
        submitLabel="Ruaj dyqanet"
        pendingLabel="Duke u ruajtur…"
        onClose={() => setEditing(null)}
        onSubmit={async (input) => {
          if (!editing) {
            return;
          }
          await updateAdminManager(editing.id, input.businessIds);
          await refresh();
        }}
      />

      <ConfirmModal
        open={approving !== null}
        title="Aprovo fletushkën?"
        message={
          approve.isError
            ? validationMessage(approve.error, "Nuk mundëm ta aprovojmë fletushkën.")
            : approving
              ? `${approving.title}${approving.business_name ? ` · ${approving.business_name}` : ""} bëhet publike.`
              : ""
        }
        confirmLabel="Aprovo"
        pending={approve.isPending}
        onClose={() => {
          approve.reset();
          setApproving(null);
        }}
        onConfirm={() => {
          if (!approving) {
            return;
          }
          approve.mutate(approving.id, {
            onSuccess: async () => {
              setApproving(null);
              await refresh();
            },
          });
        }}
      />

      <ConfirmModal
        open={pendingDelete !== null}
        danger
        title="Fshi menaxherin?"
        message={
          remove.isError
            ? validationMessage(remove.error, "Nuk mundëm ta fshijmë menaxherin.")
            : pendingDelete
              ? `Fshihet vetëm llogaria e ${pendingDelete.name || pendingDelete.email}. Dyqanet dhe fletushkat mbeten.`
              : ""
        }
        confirmLabel="Fshi"
        pending={remove.isPending}
        onClose={() => {
          remove.reset();
          setPendingDelete(null);
        }}
        onConfirm={() => {
          if (pendingDelete) {
            remove.mutate(pendingDelete.id);
          }
        }}
      />

      <Modal
        open={createdAccount !== null}
        title="Llogaria u krijua"
        onClose={() => setCreatedAccount(null)}
        footer={
          <button
            className={btnPrimary}
            type="button"
            onClick={() => setCreatedAccount(null)}
          >
            Në rregull
          </button>
        }
      >
        <p className="m-0 text-sm leading-relaxed text-muted">
          <span className="font-semibold text-ink">{createdAccount?.name}</span> është
          gati. Fjalëkalimi i përkohshëm u dërgua te{" "}
          <span className="font-semibold text-ink">{createdAccount?.email}</span>. Në
          hyrjen e parë menaxheri duhet ta ndryshojë.
        </p>
      </Modal>
    </div>
  );
}

function ManagerFormModal({
  open,
  title,
  managerId,
  initialName,
  initialEmail,
  initialShops,
  lockAccount = false,
  submitLabel,
  pendingLabel,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  managerId?: string;
  initialName: string;
  initialEmail: string;
  initialShops: string[];
  lockAccount?: boolean;
  submitLabel: string;
  pendingLabel: string;
  onClose: () => void;
  onSubmit: (input: { name: string; email: string; businessIds: string[] }) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [selected, setSelected] = useState(initialShops);
  const [error, setError] = useState<string | null>(null);
  const shops = useQuery({
    queryKey: [...managersKey, "shops", managerId ?? "new"],
    queryFn: () => fetchAvailableManagerShops(managerId),
    enabled: open,
  });

  const save = useMutation({
    mutationFn: onSubmit,
    onSuccess: () => onClose(),
    onError: (err) => {
      setError(managerError(err, "Nuk mundëm ta ruajmë menaxherin."));
    },
  });

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function onForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!lockAccount && (trimmedName === "" || trimmedEmail === "")) {
      setError("Shkruaj emrin dhe emailin.");
      return;
    }
    if (selected.length === 0) {
      setError("Zgjidh të paktën një dyqan.");
      return;
    }
    setError(null);
    save.mutate({
      name: trimmedName,
      email: trimmedEmail,
      businessIds: selected,
    });
  }

  return (
    <Modal
      open={open}
      title={title}
      size="md"
      onClose={() => {
        if (!save.isPending) {
          onClose();
        }
      }}
      footer={
        <>
          <button
            className={btnGhost}
            type="button"
            disabled={save.isPending}
            onClick={onClose}
          >
            Anulo
          </button>
          <button
            className={btnPrimary}
            type="submit"
            form="admin-manager-form"
            disabled={save.isPending}
          >
            {save.isPending ? pendingLabel : submitLabel}
          </button>
        </>
      }
    >
      <form id="admin-manager-form" className="grid gap-5" onSubmit={onForm} noValidate>
        <p className="m-0 text-[0.8125rem] leading-relaxed text-muted">
          {lockAccount
            ? "Emailin dhe fjalëkalimin e menaxherit i mban administrata. Këtu ndryshohen vetëm dyqanet."
            : "Një fjalëkalim i rastësishëm i dërgohet me email. Menaxheri sheh fletushkat e këtyre dyqaneve dhe të degëve të tyre."}
        </p>
        {error ? (
          <p className={fieldError} role="alert">
            {error}
          </p>
        ) : null}
        {lockAccount ? (
          <div className="grid gap-1">
            <p className="m-0 text-base font-semibold text-ink">{initialName || "Pa emër"}</p>
            <p className="m-0 text-sm text-muted">{initialEmail}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={fieldLabel}>
              <span>Emri</span>
              <input
                className={inputClass}
                value={name}
                maxLength={255}
                onChange={(event) => setName(event.target.value)}
                disabled={save.isPending}
                required
              />
            </label>
            <label className={fieldLabel}>
              <span>Email</span>
              <input
                className={inputClass}
                type="email"
                value={email}
                maxLength={255}
                onChange={(event) => setEmail(event.target.value)}
                disabled={save.isPending}
                required
              />
            </label>
          </div>
        )}
        <ShopPicker
          shops={shops.data ?? []}
          loading={shops.isLoading}
          failed={shops.isError}
          selected={selected}
          disabled={save.isPending}
          onToggle={toggle}
        />
      </form>
    </Modal>
  );
}

function ShopPicker({
  shops,
  loading,
  failed,
  selected,
  disabled,
  onToggle,
}: {
  shops: AssignableShop[];
  loading: boolean;
  failed: boolean;
  selected: string[];
  disabled: boolean;
  onToggle: (id: string) => void;
}) {
  const [filter, setFilter] = useState("");
  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (needle === "") {
      return shops;
    }
    return shops.filter((shop) => {
      const city = shop.city?.toLowerCase() ?? "";
      return shop.name.toLowerCase().includes(needle) || city.includes(needle);
    });
  }, [shops, filter]);

  return (
    <fieldset className="m-0 grid gap-2 border-0 p-0">
      <legend className="mb-1 text-xs font-bold tracking-[0.08em] text-muted uppercase">
        Dyqanet
      </legend>
      <div className="overflow-hidden rounded-xl border border-line">
        <TableSearch value={filter} onChange={setFilter} label="Kërko dyqanin" />
        {loading ? (
          <p className="m-0 px-4 py-5 text-sm text-muted">Duke ngarkuar dyqanet…</p>
        ) : failed ? (
          <p className="m-0 px-4 py-5 text-sm text-muted">Dyqanet nuk u ngarkuan.</p>
        ) : shops.length === 0 ? (
          <p className="m-0 px-4 py-5 text-sm leading-relaxed text-muted">
            Nuk ka dyqan të lirë. Të gjitha kanë menaxher.
          </p>
        ) : shown.length === 0 ? (
          <p className="m-0 px-4 py-5 text-sm text-muted">Nuk u gjet asnjë dyqan.</p>
        ) : (
          <ul className="m-0 max-h-64 list-none overflow-y-auto p-0">
            {shown.map((shop) => {
              const checked = selected.includes(shop.id);
              return (
                <li key={shop.id} className="border-b border-line last:border-b-0">
                  <label
                    className={`flex cursor-pointer items-center gap-3 px-4 py-3 ${
                      checked ? "bg-accent/14" : "hover:bg-sunken"
                    }`}
                  >
                    <input
                      className={checkInput}
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onToggle(shop.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{shop.name}</span>
                      {shop.city ? (
                        <span className="block truncate text-sm text-muted">{shop.city}</span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        <p className="m-0 border-t border-line px-4 py-2.5 text-sm font-semibold text-muted">
          {selected.length === 1 ? "1 dyqan i zgjedhur" : `${selected.length} dyqane të zgjedhura`}
        </p>
      </div>
    </fieldset>
  );
}
