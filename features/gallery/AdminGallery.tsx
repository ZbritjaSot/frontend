"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type FormEvent } from "react";
import { Pagination } from "@/components/ui/Pagination";
import {
  deleteAdminGallery,
  fetchAdminGallery,
  uploadAdminGallery,
} from "@/features/gallery/api";
import { titleFromFilename } from "@/features/gallery/titleFromFilename";
import { validationMessage } from "@/lib/api";
import { fieldError, inputClass } from "@/lib/ui";

const GALLERY_PAGE_SIZES = [25, 50, 100] as const;

function galleryKey(
  businessId: string,
  q = "",
  page = 1,
  perPage: number = 25,
) {
  return ["admin", "gallery", businessId, q, page, perPage] as const;
}

export function AdminGallery({ businessId }: { businessId: string }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<(typeof GALLERY_PAGE_SIZES)[number]>(25);

  function applySearch(event: FormEvent) {
    event.preventDefault();
    const next = search.trim();
    setQ((current) => {
      if (current !== next) {
        setPage(1);
      }
      return next;
    });
  }

  const gallery = useQuery({
    queryKey: galleryKey(businessId, q, page, perPage),
    queryFn: () =>
      fetchAdminGallery(businessId, { q, page, per_page: perPage }),
  });

  const images = gallery.data?.data ?? [];
  const total = gallery.data?.meta?.total ?? images.length;
  const lastPage = Math.max(1, gallery.data?.meta?.last_page ?? 1);
  if (gallery.data?.meta && page > lastPage) {
    setPage(lastPage);
  }

  async function refresh() {
    await queryClient.invalidateQueries({
      queryKey: ["admin", "gallery", businessId],
    });
  }

  return (
    <div className="relative grid gap-2">
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

      <form className="relative block min-w-0" onSubmit={applySearch}>
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
      <p className="m-0 text-xs text-muted">
        Mund të zgjedhësh disa foto. Titulli i produktit merret nga emri i
        fotos.
      </p>

      <div className="max-h-[min(28rem,calc(100dvh-16rem))] overflow-y-auto overscroll-contain rounded-xl border border-line p-2">
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
      </div>
      {images.length > 0 || total > 0 ? (
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
