"use client";

import { AddOutlinedIcon, DeleteOutlinedIcon, EditOutlinedIcon, LockOpenOutlinedIcon, LockOutlinedIcon, PlaceOutlinedIcon } from "@/components/ui/icons";
import { useEffect, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import { Tooltip } from "@/components/ui/Tooltip";
import { dataCell, dataRowCard } from "@/components/ui/DataRow";
import { useStepReorder } from "@/features/admin/DragList";
import { ADMIN_CITIES_PAGE_SIZE } from "@/features/admin/citiesApi";
import {
  useAdminCities,
  useCreateCity,
  useDeleteCity,
  useReorderCities,
  useUpdateCity,
} from "@/hooks/useAdminCities";
import { validationMessage } from "@/lib/api";
import { button, checkInput, fieldError, fieldLabel, iconButton, input, offerStatusClass, pageTitle, panelLead } from "@/lib/ui";
import { cityFormSchema, type CityFormInput } from "@/schemas/city";
import type { City } from "@/types";

const emptyForm: CityFormInput = { name: "", is_active: true };

export function AdminCities() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const { data, isLoading, isError, error, refetch } = useAdminCities(page, q);

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

  const createMutation = useCreateCity();
  const updateMutation = useUpdateCity();
  const deleteMutation = useDeleteCity();
  const reorderMutation = useReorderCities(page);

  const [editor, setEditor] = useState<City | "new" | null>(null);
  const [form, setForm] = useState<CityFormInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<City | null>(null);

  const cities = data?.data ?? [];
  const lastPage = data?.meta?.last_page;
  const total = data?.meta?.total ?? cities.length;
  if (lastPage !== undefined && page > lastPage) {
    setPage(lastPage);
  }

  const { liveRegion, moveButtons } = useStepReorder({
    items: cities,
    getLabel: (city) => city.name,
    onReorder: (ids) => reorderMutation.mutate(ids),
    disabled: q !== "" || reorderMutation.isPending,
  });

  function openCreate() {
    setForm(emptyForm);
    setFormError(null);
    setEditor("new");
  }

  function openEdit(city: City) {
    setForm({ name: city.name, is_active: city.is_active });
    setFormError(null);
    setEditor(city);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = cityFormSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Kontrollo fushat.");
      return;
    }
    setFormError(null);
    try {
      if (editor === "new") {
        await createMutation.mutateAsync(parsed.data);
      } else if (editor) {
        await updateMutation.mutateAsync({ id: editor.id, ...parsed.data });
      }
      setEditor(null);
    } catch (submitError) {
      setFormError(validationMessage(submitError, "Nuk mundëm ta ruajmë qytetin."));
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending;

  const header = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <h1 className={`${pageTitle} mb-0!`}>Qytetet</h1>
      <button className={button()} type="button" onClick={openCreate}>
        <AddOutlinedIcon fontSize="small" />
        Shto qytet
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {header}
        {liveRegion}
        <Spinner label="Duke ngarkuar qytetet" />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {header}
        {liveRegion}
        <div className="max-w-[40rem]">
          <p className={panelLead}>{validationMessage(error, "Nuk mundëm t’i ngarkojmë qytetet.")}</p>
          <button className={button({ variant: "secondary" })} type="button" onClick={() => refetch()}>
            Provo përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}
      {liveRegion}
      <p className={`${panelLead} mb-4 max-w-[40rem]`}>
        Këto qytete shfaqen në filtrat e katalogut dhe te zgjedhja e qytetit për bizneset. Edhe qytetet pa oferta shfaqen.
      </p>
      {reorderMutation.isError ? (
        <p className={fieldError} role="alert">
          {validationMessage(reorderMutation.error, "Nuk mundëm ta ndryshojmë renditjen.")}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-line">
        <TableSearch value={query} onChange={setQuery} label="Kërko qytetin" />
        {q !== "" ? (
          <p className="m-0 border-b border-line px-4 py-2 text-sm text-muted">Renditja fiket gjatë kërkimit.</p>
        ) : null}
        {cities.length === 0 ? (
          <p className="m-0 px-4 py-6 text-sm leading-relaxed text-muted">
            {q === "" ? "Nuk ka qytete ende." : "Nuk u gjet asnjë qytet."}
          </p>
        ) : (
          <div>
            <div className="overflow-x-auto md:grid md:grid-cols-[minmax(12rem,1fr)_auto_auto_auto] md:gap-x-4">
              <div className="col-span-4 hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid">
                <span className="whitespace-nowrap">Qyteti</span>
                <span className="whitespace-nowrap">Bizneset</span>
                <span className="whitespace-nowrap">Statusi</span>
                <span className="border-l border-line pl-4 whitespace-nowrap">Veprimet</span>
              </div>
              <ul className="col-span-4 m-0 list-none p-0 md:grid md:grid-cols-subgrid">
                {cities.map((city, index) => (
                  <li
                    key={city.id}
                    className={`col-span-4 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4 ${dataRowCard}`}
                  >
                    <div className={`flex min-w-0 items-center gap-3 ${dataCell.title}`}>
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-sunken text-muted">
                        <PlaceOutlinedIcon fontSize="small" />
                      </span>
                      <p className={`m-0 truncate text-base font-semibold ${dataCell.titleText}`}>{city.name}</p>
                    </div>
                    <span className="text-sm text-muted">{city.businesses_count ?? 0}</span>
                    <Tooltip
                      className={dataCell.status}
                      content={city.is_active ? "Qyteti shfaqet në filtra dhe formularë." : "Qyteti është i fshehur."}
                    >
                      <span
                        className={`${offerStatusClass(city.is_active ? "approved" : "rejected")} mt-0! w-fit self-center!`}
                      >
                        {city.is_active ? "Aktiv" : "Joaktiv"}
                      </span>
                    </Tooltip>
                    <div className={`flex items-center gap-1.5 border-l border-line pl-4 ${dataCell.actions}`}>
                      {q === "" ? (
                        <span className="inline-flex gap-1.5 md:contents">{moveButtons(city, index)}</span>
                      ) : null}
                      <Tooltip content="Ndrysho">
                        <button className={iconButton} type="button" aria-label={`Ndrysho ${city.name}`} onClick={() => openEdit(city)}>
                          <EditOutlinedIcon fontSize="small" />
                        </button>
                      </Tooltip>
                      <Tooltip content={city.is_active ? "Çaktivizo" : "Aktivizo"}>
                        <button
                          className={iconButton}
                          type="button"
                          aria-label={city.is_active ? `Çaktivizo ${city.name}` : `Aktivizo ${city.name}`}
                          onClick={() => updateMutation.mutate({ id: city.id, is_active: !city.is_active })}
                        >
                          {city.is_active ? (
                            <LockOutlinedIcon fontSize="small" />
                          ) : (
                            <LockOpenOutlinedIcon fontSize="small" className="text-accent-fg!" />
                          )}
                        </button>
                      </Tooltip>
                      <Tooltip content="Fshi">
                        <button className={iconButton} type="button" aria-label={`Fshi ${city.name}`} onClick={() => setPendingDelete(city)}>
                          <DeleteOutlinedIcon fontSize="small" className="text-danger!" />
                        </button>
                      </Tooltip>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Pagination
              page={page}
              lastPage={lastPage ?? 1}
              total={total}
              perPage={ADMIN_CITIES_PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <Modal
        open={editor !== null}
        size="md"
        title={editor === "new" ? "Qytet i ri" : "Ndrysho qytetin"}
        onClose={() => {
          if (!pending) {
            setEditor(null);
          }
        }}
        footer={
          <>
            <button className={button({ variant: "secondary" })} type="button" disabled={pending} onClick={() => setEditor(null)}>
              Anulo
            </button>
            <button className={button()} type="submit" form="admin-city-form" disabled={pending} aria-busy={pending}>
              {pending ? "Duke u ruajtur…" : "Ruaj"}
            </button>
          </>
        }
      >
        <form id="admin-city-form" className="flex max-w-[40rem] flex-col gap-5" onSubmit={onSubmit} noValidate>
          {formError ? (
            <p className={fieldError} role="alert">
              {formError}
            </p>
          ) : null}
          <label className={fieldLabel}>
            <span>Emri</span>
            <input
              className={input()}
              value={form.name}
              maxLength={255}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          {editor !== "new" && editor ? (
            <p className="m-0 text-sm leading-relaxed text-muted">
              Nëse e riemërton, bizneset në këtë qytet përditësohen automatikisht.
            </p>
          ) : null}
          <label className="flex cursor-pointer flex-row items-start gap-3 font-medium text-ink select-none">
            <input
              className={checkInput}
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            <span className="min-w-0 flex-1 pt-px leading-[1.4]">Aktiv në filtra dhe formularë</span>
          </label>
        </form>
      </Modal>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Fshi qytetin"
        message={
          deleteMutation.isError
            ? validationMessage(deleteMutation.error, "Nuk mundëm ta fshijmë qytetin.")
            : pendingDelete
              ? `Fshi “${pendingDelete.name}”? Nuk fshihet nëse një biznes e përdor; atëherë çaktivizoje.`
              : ""
        }
        confirmLabel="Fshi"
        danger
        pending={deleteMutation.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) {
            return;
          }
          deleteMutation.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
      />
    </div>
  );
}
