"use client";

import { SearchIcon } from "@/components/ui/icons";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/SelectField";
import {
  useGalleryPhotos,
  type GalleryAudience,
  type GallerySource,
} from "@/features/gallery/useGalleryPhotos";
import { validationMessage } from "@/lib/api";
import { button, fieldError, fieldLabel, input } from "@/lib/ui";
import type { OfferImage } from "@/types";

/** Keeps one flyer request a sensible size; the server stores every row in one go. */
export const MAX_BULK_PICKS = 50;

const sources: { id: GallerySource; label: string }[] = [
  { id: "platform", label: "Galeria ZbritjaSot" },
  { id: "mine", label: "Galeria ime" },
];

export type GalleryMultiPick = {
  images: OfferImage[];
  /** Optional category applied to every new row. */
  categoryId: string | null;
};

/**
 * Pick many gallery photos at once. Each picked photo becomes one product row
 * in the offer form, titled from the photo. Selection survives tab switches and
 * searches, and keeps the order photos were picked in.
 */
export function GalleryMultiPicker({
  open,
  onClose,
  onConfirm,
  gallery = "biz",
  businessId,
  takenIds,
  categoryOptions,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (pick: GalleryMultiPick) => void;
  gallery?: GalleryAudience;
  businessId?: string;
  /** Photos already on a product row; shown as added and not selectable. */
  takenIds: ReadonlySet<string>;
  categoryOptions: { value: string; label: string }[];
}) {
  const [source, setSource] = useState<GallerySource>("platform");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<OfferImage[]>([]);
  const [categoryId, setCategoryId] = useState("");

  const photos = useGalleryPhotos({ source, gallery, businessId, q, enabled: open });
  const images = photos.data?.pages.flatMap((page) => page.data) ?? [];
  const full = picked.length >= MAX_BULK_PICKS;

  function reset() {
    setSource("platform");
    setSearch("");
    setQ("");
    setPicked([]);
    setCategoryId("");
  }

  function close() {
    reset();
    onClose();
  }

  function applySearch(event: FormEvent) {
    event.preventDefault();
    // Portaled inside the offer <form>: React would bubble this submit to it.
    event.stopPropagation();
    setQ(search.trim());
  }

  function toggle(image: OfferImage) {
    setPicked((current) => {
      if (current.some((item) => item.id === image.id)) {
        return current.filter((item) => item.id !== image.id);
      }
      if (current.length >= MAX_BULK_PICKS) {
        return current;
      }
      return [...current, image];
    });
  }

  return (
    <Modal
      open={open}
      title="Zgjidh produktet nga galeria"
      size="lg"
      onClose={close}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-sm font-semibold text-muted tabular-nums" role="status">
            {picked.length === 0
              ? "Asnjë e zgjedhur"
              : `${picked.length} ${picked.length === 1 ? "e zgjedhur" : "të zgjedhura"}`}
            {full ? ` · maksimumi ${MAX_BULK_PICKS}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {picked.length > 0 ? (
              <button
                type="button"
                className={button({ variant: "secondary" })}
                onClick={() => setPicked([])}
              >
                Pastro
              </button>
            ) : null}
            <button
              type="button"
              className={button()}
              disabled={picked.length === 0}
              onClick={() => {
                onConfirm({ images: picked, categoryId: categoryId || null });
                reset();
              }}
            >
              {picked.length <= 1 ? "Shto produktin" : `Shto ${picked.length} produkte`}
            </button>
          </div>
        </div>
      }
    >
      <div className="mb-4 flex gap-1 border-b border-line" role="tablist">
        {sources.map((item) => {
          const active = source === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`-mb-px cursor-pointer border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
              onClick={() => {
                setSource(item.id);
                setSearch("");
                setQ("");
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

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
              placeholder="Kërko produkt"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button type="submit" className="sr-only">
            Kërko
          </button>
        </form>

        {photos.isError ? (
          <p className={fieldError} role="alert">
            {validationMessage(photos.error, "Galeria nuk u ngarkua.")}
          </p>
        ) : null}

        {photos.isLoading ? (
          <p className="m-0 text-sm text-muted">Duke ngarkuar…</p>
        ) : images.length > 0 ? (
          <ul className="m-0 grid max-h-[min(24rem,45vh)] list-none grid-cols-3 gap-2 overflow-y-auto p-0 sm:grid-cols-4">
            {images.map((image) => {
              const taken = takenIds.has(image.id);
              const order = picked.findIndex((item) => item.id === image.id);
              const selected = order >= 0;
              return (
                <li key={image.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    disabled={taken || (full && !selected)}
                    aria-label={`${image.title || "Pa titull"}${taken ? " (shtuar)" : ""}`}
                    className="grid w-full cursor-pointer gap-1 text-left disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => toggle(image)}
                  >
                    <span
                      className={`relative block aspect-square w-full overflow-hidden rounded-2xl ${
                        selected ? "ring-2 ring-accent ring-offset-2 ring-offset-elevated" : ""
                      }`}
                    >
                      <Image
                        src={image.thumb_url}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="120px"
                      />
                      <span
                        aria-hidden="true"
                        className={`absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full text-xs font-bold tabular-nums ${
                          selected
                            ? "bg-accent text-on-accent"
                            : "border-2 border-white/90 bg-black/25"
                        }`}
                      >
                        {selected ? order + 1 : ""}
                      </span>
                      {taken ? (
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-[11px] font-bold text-white">
                          Shtuar
                        </span>
                      ) : null}
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
            {source === "mine"
              ? "Nuk ka foto ende në galerinë tënde."
              : "Nuk u gjet asnjë foto në galerinë e platformës."}
          </p>
        )}

        {photos.hasNextPage ? (
          <button
            type="button"
            disabled={photos.isFetchingNextPage}
            className={button({ variant: "secondary", size: "sm" })}
            onClick={() => void photos.fetchNextPage()}
          >
            {photos.isFetchingNextPage ? "Duke ngarkuar…" : "Ngarko më shumë"}
          </button>
        ) : null}

        <div className="grid gap-1.5 border-t border-line pt-3">
          <span className={fieldLabel}>Kategoria për të gjitha (opsionale)</span>
          <SelectField
            value={categoryId}
            onChange={setCategoryId}
            options={categoryOptions}
            searchable
            placeholder="Zgjidh kategori"
            aria-label="Kategoria për të gjitha produktet e zgjedhura"
          />
          <span className="text-xs font-medium text-muted">
            Mund ta ndryshosh për secilin produkt më pas.
          </span>
        </div>
      </div>
    </Modal>
  );
}
