"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Image from "next/image";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import {
  deleteAdminPlatformGallery,
  fetchAdminPlatformGallery,
  updateAdminPlatformGallery,
  uploadAdminPlatformGallery,
} from "@/features/gallery/api";
import { validationMessage } from "@/lib/api";
import {
  btnGhost,
  btnPrimary,
  fieldError,
  fieldLabel,
  inputClass,
  pageTitle,
  panelLead,
} from "@/lib/ui";
import type { OfferImage } from "@/types";

const PAGE_SIZE = 24;
export const adminPlatformGalleryQueryKey = ["admin", "platform-gallery"] as const;

export function AdminPlatformGallery() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editor, setEditor] = useState<"new" | OfferImage | null>(null);
  const [title, setTitle] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OfferImage | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(query.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const gallery = useInfiniteQuery({
    queryKey: [...adminPlatformGalleryQueryKey, q],
    queryFn: ({ pageParam }) =>
      fetchAdminPlatformGallery({ q, page: pageParam, per_page: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const meta = last.meta;
      if (!meta || meta.current_page >= meta.last_page) {
        return undefined;
      }
      return meta.current_page + 1;
    },
  });

  const images = gallery.data?.pages.flatMap((page) => page.data) ?? [];

  function openCreate() {
    setEditor("new");
    setTitle("");
    setPendingFile(null);
    setFormError(null);
  }

  function openEdit(image: OfferImage) {
    setEditor(image);
    setTitle(image.title ?? "");
    setPendingFile(null);
    setFormError(null);
  }

  function closeEditor() {
    setEditor(null);
    setPendingFile(null);
    setFormError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError("Titulli është i detyrueshëm.");
      return;
    }
    setFormError(null);
    setBusy(true);
    try {
      if (editor === "new") {
        if (!pendingFile) {
          setFormError("Zgjidh një foto për të ngarkuar.");
          setBusy(false);
          return;
        }
        await uploadAdminPlatformGallery(pendingFile, cleanTitle);
      } else if (editor) {
        await updateAdminPlatformGallery(editor.id, {
          title: cleanTitle,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: adminPlatformGalleryQueryKey,
      });
      closeEditor();
    } catch (caught) {
      setFormError(validationMessage(caught, "Nuk mundëm ta ruajmë foton."));
    } finally {
      setBusy(false);
    }
  }

  const header = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className={`${pageTitle} mb-0!`}>Galeria ZbritjaSot</h1>
        <p className={`${panelLead} mt-1`}>
          Foto të përbashkëta që bizneset mund t’i përdorin te ofertat.
        </p>
      </div>
      <button className={btnPrimary} type="button" onClick={openCreate}>
        <AddOutlinedIcon fontSize="small" />
        Shto foto
      </button>
    </div>
  );

  if (gallery.isLoading) {
    return (
      <div>
        {header}
        <Spinner label="Duke ngarkuar galerinë" />
      </div>
    );
  }

  if (gallery.isError) {
    return (
      <div>
        {header}
        <div className="max-w-[40rem]">
          <p className={panelLead}>
            {validationMessage(gallery.error, "Nuk mundëm ta ngarkojmë galerinë.")}
          </p>
          <button
            className={btnGhost}
            type="button"
            onClick={() => void gallery.refetch()}
          >
            Provo përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}

      <div className="overflow-hidden rounded-2xl border border-line bg-elevated">
        <TableSearch value={query} onChange={setQuery} label="Kërko" />

        {images.length === 0 ? (
          <p className="m-0 px-4 py-8 text-sm text-muted">
            {q === ""
              ? "Nuk ka foto ende. Shto të parën."
              : "Nuk u gjet asnjë foto."}
          </p>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {images.map((image) => (
              <li
                key={image.id}
                className="group relative overflow-hidden rounded-xl border border-line bg-sunken"
              >
                <span className="relative block aspect-square">
                  <Image
                    src={image.thumb_url}
                    alt={image.title ?? ""}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="160px"
                  />
                </span>
                <div className="grid gap-1 border-t border-line p-2">
                  <p className="m-0 truncate text-sm font-semibold text-ink">
                    {image.title || "Pa titull"}
                  </p>
                  <div className="mt-1 flex gap-1">
                    <button
                      type="button"
                      aria-label="Ndrysho"
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-elevated text-ink hover:border-accent/60"
                      onClick={() => openEdit(image)}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button
                      type="button"
                      aria-label="Fshi"
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-elevated text-danger hover:border-danger/60"
                      onClick={() => setPendingDelete(image)}
                    >
                      <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {gallery.hasNextPage ? (
          <div className="border-t border-line p-3">
            <button
              type="button"
              disabled={gallery.isFetchingNextPage}
              className={`${btnGhost} min-h-10 disabled:opacity-60`}
              onClick={() => void gallery.fetchNextPage()}
            >
              {gallery.isFetchingNextPage
                ? "Duke ngarkuar…"
                : "Ngarko më shumë"}
            </button>
          </div>
        ) : null}
      </div>

      <Modal
        open={editor !== null}
        title={editor === "new" ? "Shto foto në platformë" : "Ndrysho foton"}
        size="md"
        onClose={closeEditor}
      >
        <form className="grid gap-3" onSubmit={(event) => void onSubmit(event)}>
          {formError ? (
            <p className={fieldError} role="alert">
              {formError}
            </p>
          ) : null}

          {editor === "new" ? (
            <div className="grid gap-2">
              <span className={fieldLabel}>Foto</span>
              <button
                type="button"
                className={`${btnGhost} min-h-11 justify-start`}
                onClick={() => inputRef.current?.click()}
              >
                {pendingFile ? pendingFile.name : "Zgjidh skedar…"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  setPendingFile(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
              />
            </div>
          ) : editor && typeof editor !== "string" ? (
            <div className="relative mx-auto aspect-square w-32 overflow-hidden rounded-xl border border-line">
              <Image
                src={editor.thumb_url}
                alt={editor.title ?? ""}
                fill
                unoptimized
                className="object-cover"
                sizes="128px"
              />
            </div>
          ) : null}

          <label className="grid gap-1.5">
            <span className={fieldLabel}>Titulli</span>
            <input
              className={inputClass}
              value={title}
              maxLength={160}
              required
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <div className="mt-1 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className={`${btnPrimary} min-h-10 disabled:opacity-60`}
            >
              {busy ? "Duke ruajtur…" : "Ruaj"}
            </button>
            <button
              type="button"
              className={btnGhost}
              disabled={busy}
              onClick={closeEditor}
            >
              Anulo
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Fshi foton?"
        message="Ofertat që e përdorin këtë foto do të mbeten pa imazh. Skedari hiqet nga magazinimi."
        danger
        confirmLabel="Fshi"
        pending={busy}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) {
            return;
          }
          void (async () => {
            setBusy(true);
            try {
              await deleteAdminPlatformGallery(pendingDelete.id);
              await queryClient.invalidateQueries({
                queryKey: adminPlatformGalleryQueryKey,
              });
              setPendingDelete(null);
            } catch (caught) {
              setFormError(validationMessage(caught, "Fotoja nuk u fshi."));
              setPendingDelete(null);
            } finally {
              setBusy(false);
            }
          })();
        }}
      />
    </div>
  );
}
