"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Pagination } from "@/components/ui/Pagination";
import {
  fetchBizGallery,
  uploadBizGallery,
} from "@/features/gallery/api";
import {
  GalleryUploadModal,
  type PendingGalleryPhoto,
} from "@/features/gallery/GalleryUploadModal";
import { bizGalleryQueryKey } from "@/features/gallery/ItemPhoto";
import { validationMessage } from "@/lib/api";
import { fieldError, inputClass } from "@/lib/ui";

const GALLERY_PAGE_SIZES = [25, 50, 100] as const;

function galleryKey(q = "", page = 1, perPage: number = 25) {
  return [...bizGalleryQueryKey, q, page, perPage] as const;
}

export function BizGallery() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<(typeof GALLERY_PAGE_SIZES)[number]>(25);
  const [uploadProgress, setUploadProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

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
    queryKey: galleryKey(q, page, perPage),
    queryFn: () => fetchBizGallery({ q, page, per_page: perPage }),
  });

  const images = gallery.data?.data ?? [];
  const total = gallery.data?.meta?.total ?? images.length;
  const lastPage = Math.max(1, gallery.data?.meta?.last_page ?? 1);
  if (gallery.data?.meta && page > lastPage) {
    setPage(lastPage);
  }

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: bizGalleryQueryKey });
  }

  return (
    <div className="relative grid gap-2">
      {error && !uploaderOpen ? (
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
        Titulli merret nga emri i fotos. Mund ta ndryshosh para se të ruash.
      </p>

      <div className="max-h-[min(28rem,calc(100dvh-16rem))] overflow-y-auto overscroll-contain rounded-xl border border-line p-2">
        <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          <li>
            <button
              type="button"
              disabled={busy}
              aria-label="Shto foto"
              className="grid aspect-square w-full place-items-center rounded-xl border border-dashed border-line bg-sunken text-muted disabled:opacity-60"
              onClick={() => {
                setError(null);
                setUploaderOpen(true);
              }}
            >
              <AddOutlinedIcon fontSize="small" />
            </button>
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
      <GalleryUploadModal
        open={uploaderOpen}
        busy={busy}
        error={error}
        progress={uploadProgress}
        onClose={() => {
          setUploaderOpen(false);
          setError(null);
          setUploadProgress(null);
        }}
        onSubmit={(photos: PendingGalleryPhoto[]) => {
          void (async () => {
            setError(null);
            setBusy(true);
            setUploadProgress({ done: 0, total: photos.length });
            try {
              for (let index = 0; index < photos.length; index += 1) {
                const photo = photos[index];
                if (!photo) {
                  continue;
                }
                await uploadBizGallery(photo.file, photo.title.trim());
                setUploadProgress({ done: index + 1, total: photos.length });
              }
              setPage(1);
              await refresh();
              setUploaderOpen(false);
              setError(null);
            } catch (caught) {
              setError(validationMessage(caught, "Fotoja nuk u ngarkua."));
              await refresh();
            } finally {
              setBusy(false);
              setUploadProgress(null);
            }
          })();
        }}
      />
    </div>
  );
}
