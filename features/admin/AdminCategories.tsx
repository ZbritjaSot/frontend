"use client";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from "@/hooks/useAdminCategories";
import { validationMessage } from "@/lib/api";
import {
  btnDanger,
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
import { categoryFormSchema, type CategoryFormInput } from "@/schemas/category";
import type { Category } from "@/types";

const emptyForm: CategoryFormInput = {
  name: "",
  slug: "",
  is_active: true,
};

const rowActionClass = `${btnGhost} ${btnSm} min-w-[5.5rem] flex-auto min-[800px]:flex-none`;

const arrowClass =
  "inline-flex h-[1.35rem] w-7 cursor-pointer items-center justify-center rounded-md border border-line bg-transparent p-0 text-ink disabled:cursor-not-allowed disabled:opacity-35";

export function AdminCategories() {
  const { data, isLoading, isError, error, refetch } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories();

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

  if (isLoading) {
    return <Spinner label="Duke ngarkuar kategoritë" />;
  }

  if (isError) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë kategoritë.")}
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
          Shto kategori
        </button>
      </div>
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
        <ul className="m-0 list-none p-0">
          {categories.map((category, index) => (
            <li
              key={category.id}
              className={`flex flex-row items-center gap-3 border-b border-line py-5${
                overId === category.id
                  ? " outline outline-1 outline-dashed outline-accent outline-offset-2"
                  : ""
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setOverId(category.id);
              }}
              onDragLeave={() => {
                setOverId((current) => (current === category.id ? null : current));
              }}
              onDrop={() => dropOn(category.id)}
            >
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  className={arrowClass}
                  type="button"
                  aria-label="Lëviz lart"
                  disabled={index === 0 || reorderMutation.isPending}
                  onClick={() => move(index, index - 1)}
                >
                  <KeyboardArrowUpIcon className="text-[16px]!" fontSize="inherit" />
                </button>
                <button
                  className={arrowClass}
                  type="button"
                  aria-label="Lëviz poshtë"
                  disabled={
                    index === categories.length - 1 || reorderMutation.isPending
                  }
                  onClick={() => move(index, index + 1)}
                >
                  <KeyboardArrowDownIcon className="text-[16px]!" fontSize="inherit" />
                </button>
              </div>
              <div
                className={`flex min-w-0 flex-1 cursor-grab items-start gap-2${
                  draggingId === category.id ? " opacity-45" : ""
                }`}
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
                <DragIndicatorIcon fontSize="small" className="mt-0.5 text-muted" />
                <span className="min-w-0">
                  <span className="m-0 block text-[1.0625rem] font-semibold">
                    {category.name}
                  </span>
                  <span className="mt-[0.3rem] block text-sm leading-[1.45] text-muted">
                    {category.slug}
                  </span>
                </span>
              </div>
              <span
                className={offerStatusClass(
                  category.is_active ? "approved" : "rejected",
                )}
              >
                {category.is_active ? "Aktive" : "Joaktive"}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  className={rowActionClass}
                  type="button"
                  onClick={() => openEdit(category)}
                >
                  Ndrysho
                </button>
                <button
                  className={rowActionClass}
                  type="button"
                  onClick={() =>
                    updateMutation.mutate({
                      id: category.id,
                      is_active: !category.is_active,
                    })
                  }
                >
                  {category.is_active ? "Çaktivizo" : "Aktivizo"}
                </button>
                <button
                  className={`${btnDanger} ${btnSm} min-w-[5.5rem] flex-auto min-[800px]:flex-none`}
                  type="button"
                  onClick={() => setPendingDelete(category)}
                >
                  Fshi
                </button>
              </div>
            </li>
          ))}
        </ul>
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
