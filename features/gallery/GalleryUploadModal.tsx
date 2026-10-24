"use client";

import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { titleFromFilename } from "@/features/gallery/titleFromFilename";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import { btnGhost, btnPrimary, fieldError, inputClass } from "@/lib/ui";

export type PendingGalleryPhoto = {
  key: string;
  file: File;
  title: string;
  previewUrl: string;
};

function revokePreviews(photos: PendingGalleryPhoto[]) {
  for (const photo of photos) {
    URL.revokeObjectURL(photo.previewUrl);
  }
}

export function photosFromFiles(files: File[]): PendingGalleryPhoto[] {
  return files.map((file, index) => ({
    key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
    file,
    title: titleFromFilename(file.name),
    previewUrl: URL.createObjectURL(file),
  }));
}

type GalleryUploadModalProps = {
  open: boolean;
  title?: string;
  busy?: boolean;
  error?: string | null;
  progress?: { done: number; total: number } | null;
  onClose: () => void;
  onSubmit: (photos: PendingGalleryPhoto[]) => void;
};

export function GalleryUploadModal({
  open,
  title = "Shto foto",
  busy = false,
  error = null,
  progress = null,
  onClose,
  onSubmit,
}: GalleryUploadModalProps) {
  function close() {
    if (busy) {
      return;
    }
    onClose();
  }

  return (
    <Modal open={open} title={title} size="md" onClose={close}>
      {open ? (
        <GalleryUploadForm
          busy={busy}
          error={error}
          progress={progress}
          onClose={close}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}

function GalleryUploadForm({
  busy,
  error,
  progress,
  onClose,
  onSubmit,
}: {
  busy: boolean;
  error: string | null;
  progress: { done: number; total: number } | null;
  onClose: () => void;
  onSubmit: (photos: PendingGalleryPhoto[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<PendingGalleryPhoto[]>([]);
  const [photos, setPhotos] = useState<PendingGalleryPhoto[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  useLeaveGuard(busy);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => revokePreviews(photosRef.current);
  }, []);

  function replacePhotos(next: PendingGalleryPhoto[]) {
    revokePreviews(photosRef.current);
    photosRef.current = next;
    setPhotos(next);
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setLocalError(null);
        if (photos.length === 0) {
          setLocalError("Zgjidh të paktën një foto për të ngarkuar.");
          return;
        }
        const untitled = photos.find((photo) => photo.title.trim() === "");
        if (untitled) {
          setLocalError(
            `Skedari “${untitled.file.name}” nuk ka titull të vlefshëm.`,
          );
          return;
        }
        onSubmit(photos);
      }}
    >
      {error || localError ? (
        <p className={fieldError} role="alert">
          {error ?? localError}
        </p>
      ) : null}

      <div className="grid min-w-0 gap-2">
        <button
          type="button"
          className={`grid w-full place-items-center gap-1 rounded-2xl border border-dashed border-line bg-sunken px-4 text-center text-ink hover:border-accent/60 ${
            photos.length === 0 ? "py-7" : "py-3"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <AddPhotoAlternateOutlinedIcon className="text-muted" />
          <span className="text-base font-bold">
            {photos.length === 0 ? "Ngarko foto" : "Ndrysho fotot"}
          </span>
          <span className="text-xs font-medium text-muted">
            {photos.length === 0
              ? "JPEG, PNG ose WebP. Mund të zgjedhësh disa."
              : photos.length === 1
                ? "1 foto e zgjedhur"
                : `${photos.length} foto të zgjedhura`}
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
            setLocalError(null);
            replacePhotos(photosFromFiles(files));
          }}
        />
        <p className="m-0 text-xs text-muted">
          Titulli merret nga emri i fotos. Mund ta ndryshosh para se të ruash.
        </p>
        {photos.length > 0 ? (
          <ul className="m-0 max-h-72 w-full min-w-0 list-none overflow-y-auto overscroll-contain rounded-xl border border-line p-0">
            {photos.map((photo, index) => (
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
                    setPhotos((current) =>
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

      <div className="mt-1 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className={`${btnPrimary} min-h-10 disabled:opacity-60`}
        >
          {busy
            ? progress && progress.total > 1
              ? `Duke ngarkuar ${progress.done}/${progress.total}…`
              : "Duke ruajtur…"
            : "Ruaj"}
        </button>
        <button
          type="button"
          className={btnGhost}
          disabled={busy}
          onClick={onClose}
        >
          Anulo
        </button>
      </div>
    </form>
  );
}
