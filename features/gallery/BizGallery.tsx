"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type FormEvent } from "react";
import {
  fetchBizGallery,
  uploadBizGallery,
} from "@/features/gallery/api";
import { bizGalleryQueryKey } from "@/features/gallery/ItemPhoto";
import { validationMessage } from "@/lib/api";
import { btnGhost, fieldError, fieldLabel, inputClass } from "@/lib/ui";

const PAGE_SIZE = 24;

export function BizGallery() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  function applySearch(event: FormEvent) {
    event.preventDefault();
    setQ(search.trim());
  }

  const gallery = useInfiniteQuery({
    queryKey: [...bizGalleryQueryKey, q],
    queryFn: ({ pageParam }) =>
      fetchBizGallery({ q, page: pageParam, per_page: PAGE_SIZE }),
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

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: bizGalleryQueryKey });
  }

  return (
    <div className="grid gap-3">
      {error ? (
        <p className={fieldError} role="alert">
          {error}
        </p>
      ) : null}
      {gallery.isError ? (
        <p className={fieldError} role="alert">
          {validationMessage(gallery.error, "Galeria nuk u ngarkua.")}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="grid min-w-0 flex-1 gap-1.5">
          <span className={fieldLabel}>Titulli</span>
          <input
            className={inputClass}
            value={title}
            maxLength={160}
            required
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <form className="relative block min-w-0 flex-1" onSubmit={applySearch}>
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
              className={`${inputClass} pl-10`}
              value={search}
              placeholder=""
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button type="submit" className="sr-only">
            Kërko
          </button>
        </form>
      </div>

      <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        <li>
          <button
            type="button"
            disabled={busy}
            aria-label="Shto foto"
            className="grid aspect-square w-full place-items-center rounded-xl border border-dashed border-line bg-sunken text-muted disabled:opacity-60"
            onClick={() => {
              if (!title.trim()) {
                setError("Titulli është i detyrueshëm.");
                return;
              }
              inputRef.current?.click();
            }}
          >
            <AddOutlinedIcon fontSize="small" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
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
                await uploadBizGallery(file, cleanTitle);
                setTitle("");
                await refresh();
              } catch (caught) {
                setError(validationMessage(caught, "Fotoja nuk u ngarkua."));
              } finally {
                setBusy(false);
              }
            }}
          />
          <p className="m-0 mt-1 truncate text-xs font-medium text-muted">Shto</p>
        </li>
        {images.map((image) => (
          <li key={image.id}>
            <span className="relative block aspect-square overflow-hidden rounded-xl">
              <Image
                src={image.thumb_url}
                alt={image.title ?? ""}
                fill
                unoptimized
                className="object-cover"
                sizes="120px"
              />
            </span>
            <p className="m-0 mt-1 truncate text-xs font-medium text-ink">
              {image.title || "Pa titull"}
            </p>
          </li>
        ))}
      </ul>

      {gallery.hasNextPage ? (
        <button
          type="button"
          disabled={gallery.isFetchingNextPage}
          className={`${btnGhost} min-h-10 justify-self-start disabled:opacity-60`}
          onClick={() => void gallery.fetchNextPage()}
        >
          {gallery.isFetchingNextPage ? "Duke ngarkuar…" : "Ngarko më shumë"}
        </button>
      ) : null}
    </div>
  );
}
