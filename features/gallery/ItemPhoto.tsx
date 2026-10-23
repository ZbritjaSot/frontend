"use client";

import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  fetchManagerGallery,
  uploadManagerGallery,
} from "@/features/biz/managerApi";
import {
  fetchAdminGallery,
  fetchAdminPlatformGallery,
  fetchBizGallery,
  fetchBizPlatformGallery,
  uploadAdminGallery,
  uploadBizGallery,
} from "@/features/gallery/api";
import { validationMessage } from "@/lib/api";
import { btnGhost, fieldError, fieldLabel, inputClass } from "@/lib/ui";
import type { OfferImage, Paginated } from "@/types";

export const bizGalleryQueryKey = ["biz", "gallery"] as const;

type GalleryAudience = "biz" | "admin" | "manager";
type PickerTab = "upload" | "mine" | "platform";

const PAGE_SIZE = 24;

const tabs: { id: PickerTab; label: string }[] = [
  { id: "upload", label: "Shto imazh" },
  { id: "mine", label: "Galeria ime" },
  { id: "platform", label: "Galeria ZbritjaSot" },
];

function mineGalleryKey(gallery: GalleryAudience, businessId?: string, q = "") {
  if (gallery === "manager" && businessId) {
    return ["biz", "review", "gallery", businessId, q] as const;
  }
  if (gallery === "admin" && businessId) {
    return ["admin", "gallery", businessId, q] as const;
  }
  return [...bizGalleryQueryKey, q] as const;
}

function platformGalleryKey(gallery: GalleryAudience, q = "") {
  return gallery === "admin"
    ? (["admin", "platform-gallery", q] as const)
    : (["biz", "platform-gallery", q] as const);
}

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
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open || (tab !== "mine" && tab !== "platform")) {
      return;
    }
    const timer = window.setTimeout(() => {
      setQ(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, open, tab]);

  const mineKey = mineGalleryKey(gallery, businessId, q);
  const platformKey = platformGalleryKey(gallery, q);

  const minePhotos = useInfiniteQuery({
    queryKey: mineKey,
    queryFn: ({ pageParam }): Promise<Paginated<OfferImage>> => {
      const params = { q, page: pageParam, per_page: PAGE_SIZE };
      if (gallery === "manager" && businessId) {
        return fetchManagerGallery(businessId, params);
      }
      if (gallery === "admin" && businessId) {
        return fetchAdminGallery(businessId, params);
      }
      return fetchBizGallery(params);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const meta = last.meta;
      if (!meta || meta.current_page >= meta.last_page) {
        return undefined;
      }
      return meta.current_page + 1;
    },
    enabled: open && tab === "mine",
  });

  const platformPhotos = useInfiniteQuery({
    queryKey: platformKey,
    queryFn: ({ pageParam }): Promise<Paginated<OfferImage>> => {
      const params = { q, page: pageParam, per_page: PAGE_SIZE };
      if (gallery === "admin") {
        return fetchAdminPlatformGallery(params);
      }
      return fetchBizPlatformGallery(params);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const meta = last.meta;
      if (!meta || meta.current_page >= meta.last_page) {
        return undefined;
      }
      return meta.current_page + 1;
    },
    enabled: open && tab === "platform",
  });

  function close() {
    setOpen(false);
    setError(null);
    setTab("upload");
    setSearch("");
    setQ("");
  }

  function openPicker() {
    setTitle(name.trim());
    setError(null);
    setTab("upload");
    setSearch("");
    setQ("");
    setOpen(true);
  }

  async function upload(file: File | undefined) {
    if (!file) {
      return;
    }
    const cleanTitle = title.trim();
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

  const activePhotos = tab === "mine" ? minePhotos : platformPhotos;
  const images =
    activePhotos.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="relative size-16 shrink-0 sm:size-[4.75rem]">
      <button
        type="button"
        disabled={disabled || busy}
        aria-label={thumbUrl ? `Ndërro foton e ${name || "produktit"}` : "Shto foto"}
        className="relative grid size-full place-items-center overflow-hidden rounded-2xl border border-line bg-sunken text-muted disabled:opacity-60"
        onClick={openPicker}
      >
        {thumbUrl ? (
          <Image src={thumbUrl} alt="" fill unoptimized className="object-cover" sizes="76px" />
        ) : (
          <ImageOutlinedIcon fontSize="small" />
        )}
      </button>
      {thumbUrl ? (
        <button
          type="button"
          disabled={disabled || busy}
          aria-label="Hiq foton"
          className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-elevated text-danger ring-2 ring-elevated"
          onClick={onClear}
        >
          <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
        </button>
      ) : null}
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
                className={inputClass}
                value={title}
                maxLength={160}
                required
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              className="grid w-full place-items-center gap-1 rounded-2xl border border-dashed border-line bg-sunken px-4 py-7 text-center text-ink hover:border-accent/60 disabled:opacity-60"
              onClick={() => {
                if (!title.trim()) {
                  setError("Titulli është i detyrueshëm.");
                  return;
                }
                inputRef.current?.click();
              }}
            >
              <AddPhotoAlternateOutlinedIcon className="text-muted" />
              <span className="text-base font-bold">
                {busy ? "Duke ngarkuar…" : "Ngarko foto"}
              </span>
              <span className="text-xs font-medium text-muted">
                JPEG, PNG ose WebP — deri në 8MB.
              </span>
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            <label className="relative block">
              <span className="sr-only">Kërko</span>
              <SearchIcon
                fontSize="small"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
              />
              <input
                className={`${inputClass} pl-10`}
                value={search}
                placeholder=""
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

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
                          className={`relative block aspect-square w-full overflow-hidden rounded-xl ${
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
                className={`${btnGhost} min-h-10 disabled:opacity-60`}
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
