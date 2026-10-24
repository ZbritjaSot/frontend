"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import {
  deleteAdminPlatformGallery,
  fetchAdminPlatformGallery,
  updateAdminPlatformGallery,
  uploadAdminPlatformGallery,
} from "@/features/gallery/api";
import { titleFromFilename } from "@/features/gallery/titleFromFilename";
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

const GALLERY_PAGE_SIZES = [25, 50, 100] as const;
export const adminPlatformGalleryQueryKey = ["admin", "platform-gallery"] as const;

type PendingPhoto = {
  key: string;
  file: File;
  title: string;
  previewUrl: string;
};

function revokePreviews(photos: PendingPhoto[]) {
  for (const photo of photos) {
    URL.revokeObjectURL(photo.previewUrl);
  }
}

export function AdminPlatformGallery() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingPhotosRef = useRef<PendingPhoto[]>([]);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<(typeof GALLERY_PAGE_SIZES)[number]>(25);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editor, setEditor] = useState<"new" | OfferImage | null>(null);
  const [title, setTitle] = useState("");
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OfferImage | null>(null);

  function applySearch(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    setQ((current) => {
      if (current !== next) {
        setPage(1);
      }
      return next;
    });
  }

  useEffect(() => {
    pendingPhotosRef.current = pendingPhotos;
  }, [pendingPhotos]);

  useEffect(() => {
    return () => revokePreviews(pendingPhotosRef.current);
  }, []);

  function setPhotos(next: PendingPhoto[]) {
    revokePreviews(pendingPhotosRef.current);
    pendingPhotosRef.current = next;
    setPendingPhotos(next);
  }

  const gallery = useQuery({
    queryKey: [...adminPlatformGalleryQueryKey, q, page, perPage],
    queryFn: () => fetchAdminPlatformGallery({ q, page, per_page: perPage }),
  });

  const images = gallery.data?.data ?? [];
  const total = gallery.data?.meta?.total ?? images.length;
  const lastPage = Math.max(1, gallery.data?.meta?.last_page ?? 1);
  if (gallery.data?.meta && page > lastPage) {
    setPage(lastPage);
  }

  function openCreate() {
    setEditor("new");
    setTitle("");
    setPhotos([]);
    setUploadProgress(null);
    setFormError(null);
  }

  function openEdit(image: OfferImage) {
    setEditor(image);
    setTitle(image.title ?? "");
    setPhotos([]);
    setUploadProgress(null);
    setFormError(null);
  }

  function closeEditor() {
    setEditor(null);
    setPhotos([]);
    setUploadProgress(null);
    setFormError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (editor === "new") {
      if (pendingPhotos.length === 0) {
        setFormError("Zgjidh të paktën një foto për të ngarkuar.");
        return;
      }
      const untitled = pendingPhotos.find(
        (photo) => photo.title.trim() === "",
      );
      if (untitled) {
        setFormError(`Skedari “${untitled.file.name}” nuk ka titull të vlefshëm.`);
        return;
      }
      setBusy(true);
      setUploadProgress({ done: 0, total: pendingPhotos.length });
      try {
        for (let index = 0; index < pendingPhotos.length; index += 1) {
          const photo = pendingPhotos[index];
          if (!photo) {
            continue;
          }
          await uploadAdminPlatformGallery(photo.file, photo.title.trim());
          setUploadProgress({ done: index + 1, total: pendingPhotos.length });
        }
        await queryClient.invalidateQueries({
          queryKey: adminPlatformGalleryQueryKey,
        });
        closeEditor();
      } catch (caught) {
        setFormError(validationMessage(caught, "Nuk mundëm ta ruajmë foton."));
        await queryClient.invalidateQueries({
          queryKey: adminPlatformGalleryQueryKey,
        });
      } finally {
        setBusy(false);
        setUploadProgress(null);
      }
      return;
    }

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError("Titulli është i detyrueshëm.");
      return;
    }
    if (!editor) {
      return;
    }
    setBusy(true);
    try {
      await updateAdminPlatformGallery(editor.id, {
        title: cleanTitle,
      });
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
        <form onSubmit={applySearch}>
          <TableSearch
            value={query}
            onChange={setQuery}
            label="Kërko"
            submitOnEnter
          />
          <button type="submit" className="sr-only">
            Kërko
          </button>
        </form>

        {images.length === 0 ? (
          <p className="m-0 px-4 py-8 text-sm text-muted">
            {q === ""
              ? "Nuk ka foto ende. Shto të parën."
              : "Nuk u gjet asnjë foto."}
          </p>
        ) : (
          <>
            <div className="max-h-[min(40rem,calc(100dvh-20rem))] overflow-y-auto overscroll-contain">
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
            </div>
            <Pagination
              page={page}
              lastPage={lastPage}
              total={total}
              perPage={perPage}
              onPageChange={setPage}
              pageSizes={GALLERY_PAGE_SIZES}
              onPerPageChange={(next) => {
                setPerPage(next as (typeof GALLERY_PAGE_SIZES)[number]);
                setPage(1);
              }}
            />
          </>
        )}
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
            <div className="grid min-w-0 gap-2">
              <button
                type="button"
                className={`grid w-full place-items-center gap-1 rounded-2xl border border-dashed border-line bg-sunken px-4 text-center text-ink hover:border-accent/60 ${
                  pendingPhotos.length === 0 ? "py-7" : "py-3"
                }`}
                onClick={() => inputRef.current?.click()}
              >
                <AddPhotoAlternateOutlinedIcon className="text-muted" />
                <span className="text-base font-bold">
                  {pendingPhotos.length === 0 ? "Ngarko foto" : "Ndrysho fotot"}
                </span>
                <span className="text-xs font-medium text-muted">
                  {pendingPhotos.length === 0
                    ? "JPEG, PNG ose WebP. Mund të zgjedhësh disa."
                    : pendingPhotos.length === 1
                      ? "1 foto e zgjedhur"
                      : `${pendingPhotos.length} foto të zgjedhura`}
                </span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  setPhotos(
                    files.map((file, index) => ({
                      key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
                      file,
                      title: titleFromFilename(file.name),
                      previewUrl: URL.createObjectURL(file),
                    })),
                  );
                }}
              />
              <p className="m-0 text-xs text-muted">
                Titulli merret nga emri i fotos. Mund ta ndryshosh para se të
                ruash.
              </p>
              {pendingPhotos.length > 0 ? (
                <ul className="m-0 max-h-72 w-full min-w-0 list-none overflow-y-auto overscroll-contain rounded-xl border border-line p-0">
                  {pendingPhotos.map((photo, index) => (
                    <li
                      key={photo.key}
                      className="flex min-w-0 items-center gap-2.5 border-b border-line px-2 py-2 last:border-b-0"
                    >
                      {/* Native img: blob previews are local files, not next/image hosts. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.previewUrl}
                        alt=""
                        className="size-12 shrink-0 rounded-lg object-cover"
                      />
                      <input
                        className={`${inputClass} min-h-10 min-w-0 flex-1 py-2 text-sm`}
                        value={photo.title}
                        maxLength={160}
                        required
                        disabled={busy}
                        aria-label={`Titulli i fotos ${index + 1}`}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPendingPhotos((current) =>
                            current.map((item) =>
                              item.key === photo.key
                                ? { ...item, title: value }
                                : item,
                            ),
                          );
                        }}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : editor && typeof editor !== "string" ? (
            <>
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
            </>
          ) : null}

          <div className="mt-1 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className={`${btnPrimary} min-h-10 disabled:opacity-60`}
            >
              {busy
                ? uploadProgress && uploadProgress.total > 1
                  ? `Duke ngarkuar ${uploadProgress.done}/${uploadProgress.total}…`
                  : "Duke ruajtur…"
                : "Ruaj"}
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
