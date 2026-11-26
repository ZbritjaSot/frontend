"use client";

import { AddPhotoAlternateOutlinedIcon, DeleteOutlinedIcon, ImageOutlinedIcon, SearchIcon } from "@/components/ui/icons";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { uploadManagerGallery } from "@/features/biz/managerApi";
import { uploadAdminGallery, uploadBizGallery } from "@/features/gallery/api";
import {
  bizGalleryQueryKey,
  useGalleryPhotos,
  type GalleryAudience,
} from "@/features/gallery/useGalleryPhotos";
import { DROP_HERE_LABEL, fileDropZoneClass, useFileDrop } from "@/hooks/useFileDrop";
import { validationMessage } from "@/lib/api";
import { button, fieldError, fieldLabel, input } from "@/lib/ui";
import type { OfferImage } from "@/types";

export { bizGalleryQueryKey };

type PickerTab = "upload" | "mine" | "platform";

const tabs: { id: PickerTab; label: string }[] = [
  { id: "upload", label: "Shto imazh" },
  { id: "mine", label: "Galeria ime" },
  { id: "platform", label: "Galeria ZbritjaSot" },
];

export function ItemPhoto({
  name,
  thumbUrl,
  selectedId,
  businessId,
  gallery = "biz",
  disabled,
  onPick,
  onClear,
}: {
  name: string;
  thumbUrl?: string | null;
  selectedId?: string | null;
  /** When set, photos come from that shop's gallery instead of the signed-in shop. */
  businessId?: string;
  gallery?: GalleryAudience;
  disabled?: boolean;
  onPick: (image: OfferImage) => void;
  onClear: () => void;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PickerTab>("upload");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  /** A dropped file waiting for a title, so it is not lost when the name is empty. */
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  function applySearch(event: FormEvent) {
    event.preventDefault();
    // This picker is rendered in a `Modal` (a portal) inside the offer/flyer
    // `<form>` — React bubbles synthetic events along the component tree,
    // not the DOM tree, so without this the "submit" event still reaches
    // (and submits) the outer form, even though it's not a DOM ancestor.
    event.stopPropagation();
    setQ(search.trim());
  }

  const minePhotos = useGalleryPhotos({
    source: "mine",
    gallery,
    businessId,
    q,
    enabled: open && tab === "mine",
  });

  const platformPhotos = useGalleryPhotos({
    source: "platform",
    gallery,
    businessId,
    q,
    enabled: open && tab === "platform",
  });

  function close() {
    setOpen(false);
    setPendingFile(null);
    setError(null);
    setTab("upload");
    setSearch("");
    setQ("");
  }

  function openPicker() {
    setPendingFile(null);
    setTitle(name.trim());
    setError(null);
    setTab("upload");
    setSearch("");
    setQ("");
    setOpen(true);
  }

  async function upload(file: File | undefined, titleSource = title) {
    if (!file) {
      return;
    }
    const cleanTitle = titleSource.trim();
    if (!cleanTitle) {
      setError("Titulli është i detyrueshëm.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const image =
        gallery === "manager" && businessId
          ? await uploadManagerGallery(businessId, file, cleanTitle)
          : gallery === "admin" && businessId
            ? await uploadAdminGallery(businessId, file, cleanTitle)
            : await uploadBizGallery(file, cleanTitle);
      await queryClient.invalidateQueries({
        queryKey:
          gallery === "manager" && businessId
            ? (["biz", "review", "gallery", businessId] as const)
            : gallery === "admin" && businessId
              ? (["admin", "gallery", businessId] as const)
              : bizGalleryQueryKey,
      });
      setPendingFile(null);
      onPick(image);
      setTab("mine");
      setSearch("");
      setQ("");
    } catch (caught) {
      setError(validationMessage(caught, "Fotoja nuk u ngarkua."));
    } finally {
      setBusy(false);
    }
  }

  const tileDrop = useFileDrop({
    disabled: disabled || busy,
    onFiles: (files, rejection) => {
      const clean = name.trim();
      setTitle(clean);
      setOpen(true);
      if (files.length === 0) {
        if (rejection) {
          setError(rejection);
        }
        return;
      }
      if (!clean) {
        // No product name to use as the title: keep the file and ask for one.
        setPendingFile(files[0]);
        setError(rejection ?? "Titulli është i detyrueshëm.");
        return;
      }
      // Kept until the upload succeeds, so a failed upload can be retried.
      setPendingFile(files[0]);
      if (rejection) {
        setError(rejection);
      }
      void upload(files[0], clean);
    },
  });
  const pickerDrop = useFileDrop({
    disabled: busy,
    onFiles: (files, rejection) => {
      if (files.length === 0) {
        if (rejection) {
          setError(rejection);
        }
        return;
      }
      if (!title.trim()) {
        setPendingFile(files[0]);
        setError(rejection ?? "Titulli është i detyrueshëm.");
        return;
      }
      if (rejection) {
        setError(rejection);
      }
      setPendingFile(files[0]);
      void upload(files[0]);
    },
  });

  const activePhotos = tab === "mine" ? minePhotos : platformPhotos;
  const images =
    activePhotos.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="relative size-16 shrink-0 sm:size-[4.75rem]">
      {/* Only the thumb and its remove button take drops. The Modal and the
          file input stay outside so portaled drags never reach this zone. */}
      <div className="relative size-full" {...tileDrop.dropProps}>
      <button
        type="button"
        disabled={disabled || busy}
        aria-label={thumbUrl ? `Ndërro foton e ${name || "produktit"}` : "Shto foto"}
        className={`relative grid size-full place-items-center overflow-hidden rounded-2xl text-muted disabled:pointer-events-none disabled:opacity-60 ${fileDropZoneClass(tileDrop.active)}`}
        onClick={() => {
          openPicker();
        }}
      >
        {thumbUrl ? (
          <Image src={thumbUrl} alt="" fill unoptimized className="object-cover" sizes="76px" />
        ) : (
          <ImageOutlinedIcon fontSize="small" />
        )}
        {tileDrop.active ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center bg-accent/10 px-1 text-center text-[10px] font-bold leading-tight text-ink"
          >
            {DROP_HERE_LABEL}
          </span>
        ) : null}
      </button>
      {thumbUrl ? (
        <button
          type="button"
          disabled={disabled || busy}
          aria-label="Hiq foton"
          className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-elevated text-danger ring-2 ring-elevated disabled:pointer-events-none"
          onClick={onClear}
        >
          <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
        </button>
      ) : null}
      </div>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void upload(file);
        }}
      />
      <Modal open={open} title="Foto e produktit" size="lg" onClose={close}>
        {error ? (
          <p className={`${fieldError} mb-3`} role="alert">
            {error}
          </p>
        ) : null}

        <div className="mb-4 flex gap-1 border-b border-line">
          {tabs.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`-mb-px cursor-pointer border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-accent text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
                onClick={() => {
                  setError(null);
                  setTab(item.id);
                  setSearch("");
                  setQ("");
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "upload" ? (
          <div className="grid gap-3">
            <label className="grid gap-1.5">
              <span className={fieldLabel}>Titulli</span>
              <input
                className={input()}
                value={title}
                maxLength={160}
                required
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <div {...pickerDrop.dropProps}>
            <button
              type="button"
              disabled={busy}
              className={`grid w-full place-items-center gap-1 rounded-2xl px-4 py-7 text-center text-ink hover:border-accent/60 disabled:pointer-events-none disabled:opacity-60 ${fileDropZoneClass(pickerDrop.active)}`}
              onClick={() => {
                if (!title.trim()) {
                  setError("Titulli është i detyrueshëm.");
                  return;
                }
                if (pendingFile) {
                  void upload(pendingFile);
                  return;
                }
                inputRef.current?.click();
              }}
            >
              <AddPhotoAlternateOutlinedIcon className="text-muted" />
              {pickerDrop.active ? (
                <span aria-hidden="true" className="text-sm font-bold text-ink">
                  {DROP_HERE_LABEL}
                </span>
              ) : null}
              <span className="text-base font-bold">
                {busy
                  ? "Duke ngarkuar…"
                  : pendingFile
                    ? `Ngarko “${pendingFile.name}”`
                    : "Ngarko foto"}
              </span>
              <span className="text-xs font-medium text-muted">
                {pendingFile
                  ? "Shkruaj titullin, pastaj kliko për ta ngarkuar."
                  : "Rekomandohet 1200 × 1200 px. JPEG, PNG ose WebP — deri në 8MB."}
              </span>
            </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <form className="relative block" onSubmit={applySearch}>
              <label className="block">
                <span className="sr-only">Kërko</span>
                <SearchIcon
                  fontSize="small"
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                />
                <input
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  className={`${input()} pl-10`}
                  value={search}
                  placeholder=""
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <button type="submit" className="sr-only">
                Kërko
              </button>
            </form>

            {activePhotos.isError ? (
              <p className={fieldError} role="alert">
                {validationMessage(activePhotos.error, "Galeria nuk u ngarkua.")}
              </p>
            ) : null}

            {activePhotos.isLoading ? (
              <p className="m-0 text-sm text-muted">Duke ngarkuar…</p>
            ) : images.length > 0 ? (
              <ul className="m-0 grid max-h-[min(24rem,50vh)] list-none grid-cols-3 gap-2 overflow-y-auto p-0 sm:grid-cols-4">
                {images.map((image) => {
                  const selected = selectedId === image.id;
                  return (
                    <li key={image.id}>
                      <button
                        type="button"
                        className="grid w-full gap-1 text-left"
                        onClick={() => {
                          onPick(image);
                          close();
                        }}
                      >
                        <span
                          className={`relative block aspect-square w-full overflow-hidden rounded-2xl ${
                            selected
                              ? "ring-2 ring-accent ring-offset-2 ring-offset-elevated"
                              : ""
                          }`}
                        >
                          <Image
                            src={image.thumb_url}
                            alt={image.title ?? ""}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="120px"
                          />
                        </span>
                        <span className="truncate text-xs font-medium text-ink">
                          {image.title || "Pa titull"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="m-0 text-sm text-muted">
                {tab === "mine"
                  ? "Nuk ka foto ende. Ngarko të parën te Shto imazh."
                  : "Nuk u gjet asnjë foto në galerinë e platformës."}
              </p>
            )}

            {activePhotos.hasNextPage ? (
              <button
                type="button"
                disabled={activePhotos.isFetchingNextPage}
                className={button({ variant: "secondary", size: "sm" })}
                onClick={() => void activePhotos.fetchNextPage()}
              >
                {activePhotos.isFetchingNextPage
                  ? "Duke ngarkuar…"
                  : "Ngarko më shumë"}
              </button>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}
