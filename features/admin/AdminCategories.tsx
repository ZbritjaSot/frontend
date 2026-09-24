"use client";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { adminCategoryKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import {
  ADMIN_CATEGORIES_PAGE_SIZE,
  fetchAdminCategories,
} from "@/features/admin/categoriesApi";
import {
  adminCategoriesQueryKey,
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from "@/hooks/useAdminCategories";
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
import { categoryFormSchema, type CategoryFormInput } from "@/schemas/category";
import type { Category } from "@/types";

const emptyForm: CategoryFormInput = {
  name: "",
  slug: "",
  is_active: true,
};

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink hover:border-accent/60";

export function AdminCategories() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAdminCategories(page);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories(page);

  const [editor, setEditor] = useState<Category | "new" | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setFormError(null);
    setEditor("new");
  }

  function openEdit(category: Category) {
    setForm({
      name: category.name,
      slug: category.slug,
      is_active: category.is_active,
    });
    setFormError(null);
    setEditor(category);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = categoryFormSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Kontrollo fushat.");
      return;
    }
    setFormError(null);
    try {
      if (editor === "new") {
        await createMutation.mutateAsync(parsed.data);
        const firstPage = await queryClient.fetchQuery({
          queryKey: [...adminCategoriesQueryKey, 1],
          queryFn: () => fetchAdminCategories(1),
        });
        setPage(firstPage.meta?.last_page ?? 1);
      } else if (editor) {
        await updateMutation.mutateAsync({ id: editor.id, ...parsed.data });
      }
      setEditor(null);
    } catch (submitError) {
      setFormError(
        validationMessage(submitError, "Nuk mundëm ta ruajmë kategorinë."),
      );
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending;
  const categories = data?.data ?? [];
  const lastPage = data?.meta?.last_page;
  const total = data?.meta?.total ?? categories.length;
  if (lastPage !== undefined && page > lastPage) {
    setPage(lastPage);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= categories.length || from === to) {
      return;
    }
    const next = [...categories];
    const [item] = next.splice(from, 1);
    if (!item) {
      return;
    }
    next.splice(to, 0, item);
    reorderMutation.mutate(next.map((category) => category.id));
  }

  function dropOn(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
    const from = categories.findIndex((category) => category.id === draggingId);
    const to = categories.findIndex((category) => category.id === targetId);
    move(from, to);
    setDraggingId(null);
    setOverId(null);
  }

  const header = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${pageTitle} mb-0!`}>Kategoritë</h1>
        <button className={btnPrimary} type="button" onClick={openCreate}>
          Shto kategori
        </button>
      </div>
      <IndicatorKey items={adminCategoryKey} />
    </>
  );

  if (isLoading) {
    return (
      <div>
        {header}
        <Spinner label="Duke ngarkuar kategoritë" />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {header}
        <div className="max-w-[40rem]">
          <p className={panelLead}>
            {validationMessage(error, "Nuk mundëm t’i ngarkojmë kategoritë.")}
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
      {reorderMutation.isError ? (
        <p className={fieldError} role="alert">
          {validationMessage(
            reorderMutation.error,
            "Nuk mundëm ta ndryshojmë renditjen.",
          )}
        </p>
      ) : null}

      {categories.length === 0 ? (
        <div className="max-w-[40rem]">
          <p className={panelLead}>Nuk ka kategori ende.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          <div className="overflow-x-auto md:grid md:grid-cols-[2.25rem_minmax(12rem,1fr)_auto_auto] md:gap-x-4">
          <div className="col-span-4 hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid">
            <span aria-hidden />
            <span className="whitespace-nowrap">Kategoria</span>
            <span className="whitespace-nowrap">Statusi</span>
            <span className="border-l border-line pl-4 whitespace-nowrap">
              Veprimet
            </span>
          </div>
          <ul className="col-span-4 m-0 list-none p-0 md:grid md:grid-cols-subgrid">
            {categories.map((category) => (
              <li
                key={category.id}
                className={`col-span-4 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4${
                  draggingId === category.id ? " opacity-45" : ""
                }${
                  overId === category.id
                    ? " outline outline-1 outline-dashed outline-accent outline-offset-[-2px]"
                    : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setOverId(category.id);
                }}
                onDragLeave={() => {
                  setOverId((current) =>
                    current === category.id ? null : current,
                  );
                }}
                onDrop={() => dropOn(category.id)}
              >
                <button
                  type="button"
                  className="inline-flex size-9 cursor-grab items-center justify-center rounded-lg text-muted hover:bg-sunken hover:text-ink active:cursor-grabbing"
                  aria-label={`Rendit ${category.name}`}
                  draggable={!reorderMutation.isPending}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", category.id);
                    setDraggingId(category.id);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setOverId(null);
                  }}
                >
                  <DragIndicatorIcon fontSize="small" />
                </button>
                <div className="min-w-0">
                  <p className="m-0 truncate text-base font-semibold">
                    {category.name}
                  </p>
                  <p className="m-0 truncate text-sm text-muted">
                    {category.slug}
                  </p>
                </div>
                <span
                  className={`${offerStatusClass(
                    category.is_active ? "approved" : "rejected",
                  )} mt-0! w-fit self-center!`}
                >
                  {category.is_active ? "Aktive" : "Joaktive"}
                </span>
                <div className="flex items-center gap-1.5 border-l border-line pl-4">
                  <button
                    className={rowButton}
                    type="button"
                    aria-label={`Ndrysho ${category.name}`}
                    onClick={() => openEdit(category)}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </button>
                  <button
                    className={rowButton}
                    type="button"
                    aria-label={
                      category.is_active
                        ? `Çaktivizo ${category.name}`
                        : `Aktivizo ${category.name}`
                    }
                    onClick={() =>
                      updateMutation.mutate({
                        id: category.id,
                        is_active: !category.is_active,
                      })
                    }
                  >
                    {category.is_active ? (
                      <LockOutlinedIcon fontSize="small" />
                    ) : (
                      <LockOpenOutlinedIcon
                        fontSize="small"
                        className="text-accent!"
                      />
                    )}
                  </button>
                  <button
                    className={rowButton}
                    type="button"
                    aria-label={`Fshi ${category.name}`}
                    onClick={() => setPendingDelete(category)}
                  >
                    <DeleteOutlinedIcon
                      fontSize="small"
                      className="text-danger!"
                    />
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
            perPage={ADMIN_CATEGORIES_PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      <Modal
        open={editor !== null}
        title={editor === "new" ? "Kategori e re" : "Ndrysho kategorinë"}
        onClose={() => {
          if (!pending) {
            setEditor(null);
          }
        }}
        footer={
          <>
            <button
              className={btnGhost}
              type="button"
              disabled={pending}
              onClick={() => setEditor(null)}
            >
              Anulo
            </button>
            <button
              className={btnPrimary}
              type="submit"
              form="admin-category-form"
              disabled={pending}
            >
              {pending ? "Duke u ruajtur…" : "Ruaj"}
            </button>
          </>
        }
      >
        <form
          id="admin-category-form"
          className="flex max-w-[40rem] flex-col gap-5"
          onSubmit={onSubmit}
          noValidate
        >
          {formError ? (
            <p className={fieldError} role="alert">
              {formError}
            </p>
          ) : null}
          <label className={fieldLabel}>
            <span>Emri</span>
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
            <span>Slug (opsional)</span>
            <input
              className={inputClass}
              value={form.slug ?? ""}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
            />
          </label>
          <label className="flex cursor-pointer flex-row items-start gap-3 font-medium text-ink select-none">
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
            <span className="min-w-0 flex-1 pt-px leading-[1.4]">
              Aktive në faqen publike
            </span>
          </label>
        </form>
      </Modal>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Fshi kategorinë"
        message={
          deleteMutation.isError
            ? validationMessage(
                deleteMutation.error,
                "Nuk mundëm ta fshijmë kategorinë.",
              )
            : pendingDelete
              ? `Fshi “${pendingDelete.name}”? Nuk fshihet nëse një ofertë e përdor.`
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
          deleteMutation.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          });
        }}
      />
    </div>
  );
}
