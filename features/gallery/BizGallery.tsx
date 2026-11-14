"use client";

import { AddOutlinedIcon, SearchIcon } from "@/components/ui/icons";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Pagination } from "@/components/ui/Pagination";
import {
  fetchBizGallery,
  uploadBizGallery,
} from "@/features/gallery/api";
import { BulkUploadStatus } from "@/features/gallery/BulkUploadStatus";
import {
  GalleryUploadModal,
  type PendingGalleryPhoto,
} from "@/features/gallery/GalleryUploadModal";
import { bizGalleryQueryKey } from "@/features/gallery/ItemPhoto";
import { useBulkUpload } from "@/features/gallery/useBulkUpload";
import { validationMessage } from "@/lib/api";
import { fieldError, input } from "@/lib/ui";

const GALLERY_PAGE_SIZES = [25, 50, 100] as const;

function galleryKey(q = "", page = 1, perPage: number = 25) {
  return [...bizGalleryQueryKey, q, page, perPage] as const;
}

export function BizGallery() {
  const queryClient = useQueryClient();
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<(typeof GALLERY_PAGE_SIZES)[number]>(25);
  const upload = useBulkUpload(
    uploadBizGallery,
    (caught) => validationMessage(caught, "Fotoja nuk u ngarkua."),
  );

  function applySearch(event: FormEvent) {
    event.preventDefault();
    // Stop the "submit" event from bubbling to any ancestor form — this
    // search field must only ever filter the gallery, never submit anything
    // else on the page (see ItemPhoto.tsx's own applySearch for the bug this
    // guards against: a nested-in-a-form picker advancing the outer form).
    event.stopPropagation();
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
      <p className="m-0 text-xs text-muted">
        Titulli merret nga emri i fotos. Mund ta ndryshosh para se të ruash.
      </p>

      <div className="max-h-[min(28rem,calc(100dvh-16rem))] overflow-y-auto overscroll-contain rounded-2xl border border-line p-2">
        <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          <li>
            <button
              type="button"
              disabled={upload.busy}
              aria-label="Shto foto"
              className="grid aspect-square w-full place-items-center rounded-lg border border-dashed border-line bg-sunken text-muted disabled:opacity-60"
              onClick={() => {
                upload.reset();
                setUploaderOpen(true);
              }}
            >
              <AddOutlinedIcon fontSize="small" />
            </button>
            <p className="m-0 mt-1 truncate text-xs font-medium text-muted">Shto</p>
          </li>
          {images.map((image) => (
            <li key={image.id}>
              <span className="relative block aspect-square overflow-hidden rounded-lg">
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
        busy={upload.busy}
        statusView={
          upload.items.length > 0 ? (
            <BulkUploadStatus
              items={upload.items}
              summary={upload.summary}
              busy={upload.busy}
              onRetry={() => {
                void (async () => {
                  const result = await upload.retryFailed();
                  setPage(1);
                  await refresh();
                  if (result.failed === 0) {
                    setUploaderOpen(false);
                  }
                })();
              }}
            />
          ) : null
        }
        onClose={() => {
          setUploaderOpen(false);
          upload.reset();
        }}
        onSubmit={(photos: PendingGalleryPhoto[]) => {
          void (async () => {
            const result = await upload.start(photos);
            setPage(1);
            await refresh();
            if (result.failed === 0) {
              setUploaderOpen(false);
            }
          })();
        }}
      />
    </div>
  );
}
