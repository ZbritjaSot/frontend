"use client";

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
import { categoryFormSchema, type CategoryFormInput } from "@/schemas/category";
import type { Category } from "@/types";

const emptyForm: CategoryFormInput = {
  name: "",
  slug: "",
  is_active: true,
};

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
      <div className="shell-panel">
        <p className="shell-panel__lead">
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë kategoritë.")}
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
          Shto kategori
        </button>
      </div>
      {reorderMutation.isError ? (
        <p className="offer-form__error" role="alert">
          {validationMessage(
            reorderMutation.error,
            "Nuk mundëm ta ndryshojmë renditjen.",
          )}
        </p>
      ) : null}

      {categories.length === 0 ? (
        <div className="shell-panel">
          <p className="shell-panel__lead">Nuk ka kategori ende.</p>
        </div>
      ) : (
        <ul className="biz-offers__list category-order">
          {categories.map((category, index) => (
            <li
              key={category.id}
              className={[
                "biz-offer-row",
                "category-order__row",
                draggingId === category.id ? "is-dragging" : "",
                overId === category.id ? "is-over" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onDragOver={(event) => {
                event.preventDefault();
                setOverId(category.id);
              }}
              onDragLeave={() => {
                setOverId((current) => (current === category.id ? null : current));
              }}
              onDrop={() => dropOn(category.id)}
            >
              <div className="category-order__arrows">
                <button
                  className="category-order__arrow"
                  type="button"
                  aria-label="Lëviz lart"
                  disabled={index === 0 || reorderMutation.isPending}
                  onClick={() => move(index, index - 1)}
                >
                  ↑
                </button>
                <button
                  className="category-order__arrow"
                  type="button"
                  aria-label="Lëviz poshtë"
                  disabled={
                    index === categories.length - 1 || reorderMutation.isPending
                  }
                  onClick={() => move(index, index + 1)}
                >
                  ↓
                </button>
              </div>
              <div
                className="biz-offer-row__main category-order__main"
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
                <span className="biz-offer-row__name">{category.name}</span>
                <span className="biz-offer-row__meta">{category.slug}</span>
              </div>
              <span
                className={`biz-offer-row__status ${
                  category.is_active
                    ? "biz-offer-row__status--approved"
                    : "biz-offer-row__status--rejected"
                }`}
              >
                {category.is_active ? "Aktive" : "Joaktive"}
              </span>
              <div className="biz-offer-row__actions">
                <button
                  className="btn btn--ghost btn--sm"
                  type="button"
                  onClick={() => openEdit(category)}
                >
                  Ndrysho
                </button>
                <button
                  className="btn btn--ghost btn--sm"
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
                  className="btn btn--danger btn--sm"
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
              className="btn btn--ghost"
              type="button"
              disabled={pending}
              onClick={() => setEditor(null)}
            >
              Anulo
            </button>
            <button
              className="btn btn--primary"
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
          className="offer-form"
          onSubmit={onSubmit}
          noValidate
        >
          {formError ? (
            <p className="offer-form__error" role="alert">
              {formError}
            </p>
          ) : null}
          <label className="offer-form__field">
            <span>Emri</span>
            <input
              value={form.name}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>
          <label className="offer-form__field">
            <span>Slug (opsional)</span>
            <input
              value={form.slug ?? ""}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
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
            <span>Aktive në faqen publike</span>
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
