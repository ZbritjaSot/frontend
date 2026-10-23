"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  deleteAdminGallery,
  fetchAdminGallery,
  uploadAdminGallery,
} from "@/features/gallery/api";
import { titleFromFilename } from "@/features/gallery/titleFromFilename";
import { validationMessage } from "@/lib/api";
import { btnGhost, fieldError, inputClass } from "@/lib/ui";

function galleryKey(businessId: string, q = "") {
  return ["admin", "gallery", businessId, q] as const;
}

export function AdminGallery({ businessId }: { businessId: string }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const gallery = useInfiniteQuery({
    queryKey: galleryKey(businessId, q),
    queryFn: ({ pageParam }) =>
      fetchAdminGallery(businessId, { q, page: pageParam, per_page: 24 }),
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
    await queryClient.invalidateQueries({
      queryKey: ["admin", "gallery", businessId],
    });
  }

  return (
    <div className="relative grid gap-2">
      <p className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
        Galeria
      </p>
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

      <label className="relative block min-w-0">
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
      <p className="m-0 text-xs text-muted">
        Mund të zgjedhësh disa foto. Titulli i produktit merret nga emri i
        fotos.
      </p>

      <ul className="m-0 grid list-none grid-cols-4 gap-2 p-0 sm:grid-cols-6 md:grid-cols-8">
        <li>
          <button
            type="button"
            disabled={busy}
            aria-label="Shto foto"
            className="grid aspect-square w-full place-items-center rounded-xl border border-dashed border-line bg-sunken text-muted disabled:opacity-60"
            onClick={() => inputRef.current?.click()}
          >
            <AddOutlinedIcon fontSize="small" />
          </button>
          <p className="m-0 mt-1 truncate text-xs font-medium text-muted">Shto</p>
        </li>
        {images.map((image) => (
          <li key={image.id} className="relative">
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
            <button
              type="button"
              disabled={busy}
              aria-label="Hiq foton"
              className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-elevated text-danger ring-2 ring-elevated"
              onClick={async () => {
                setError(null);
                setBusy(true);
                try {
                  await deleteAdminGallery(businessId, image.id);
                  await refresh();
                } catch (caught) {
                  setError(validationMessage(caught, "Fotoja nuk u hoq."));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
            </button>
          </li>
        ))}
      </ul>
      {gallery.hasNextPage ? (
        <button
          type="button"
          disabled={gallery.isFetchingNextPage}
          className={`${btnGhost} min-h-9 justify-self-start text-sm disabled:opacity-60`}
          onClick={() => void gallery.fetchNextPage()}
        >
          {gallery.isFetchingNextPage ? "Duke ngarkuar…" : "Ngarko më shumë"}
        </button>
      ) : null}
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length === 0) {
            return;
          }
          const untitled = files.find(
            (file) => titleFromFilename(file.name) === "",
          );
          if (untitled) {
            setError(`Skedari “${untitled.name}” nuk ka titull të vlefshëm.`);
            return;
          }
          setError(null);
          setBusy(true);
          try {
            for (const file of files) {
              await uploadAdminGallery(
                businessId,
                file,
                titleFromFilename(file.name),
              );
            }
            await refresh();
          } catch (caught) {
            setError(validationMessage(caught, "Fotoja nuk u ngarkua."));
            await refresh();
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
