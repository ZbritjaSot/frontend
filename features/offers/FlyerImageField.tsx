"use client";

import { DeleteOutlinedIcon, PhotoCameraOutlinedIcon } from "@/components/ui/icons";
import { useRef, useState } from "react";
import { flyerImageFileError, readImageSize } from "@/features/offers/flyerImageFile";
import { DROP_HERE_LABEL, fileDropZoneClass, useFileDrop } from "@/hooks/useFileDrop";
import { fieldError } from "@/lib/ui";
import { Tooltip } from "@/components/ui/Tooltip";

export function FlyerImageField({
  previewUrl,
  disabled = false,
  onPick,
  onClear,
}: {
  previewUrl?: string | null;
  disabled?: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) {
      return;
    }
    const early = flyerImageFileError(file);
    if (early) {
      setError(early);
      return;
    }

    setReading(true);
    setError(null);
    try {
      const pixels = await readImageSize(file);
      const invalid = flyerImageFileError(file, pixels);
      if (invalid) {
        setError(invalid);
        return;
      }
      onPick(file);
    } catch {
      setError("Fotoja nuk u lexua. Provo një JPEG, PNG ose WebP.");
    } finally {
      setReading(false);
    }
  }

  const drop = useFileDrop({
    disabled: disabled || reading,
    validateFile: (file) => flyerImageFileError(file),
    onFiles: (files, rejection) => {
      if (files.length === 0) {
        if (rejection) {
          setError(rejection);
        }
        return;
      }
      void onFile(files[0]);
    },
  });

  const replaceLabel = previewUrl ? "Ndërro imazhin e fletushkës" : "Ngarko imazhin e fletushkës";

  return (
    <div className="mt-6">
      <p className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
        Imazhi i fletushkës
      </p>
      <p className="m-0 mt-1 text-sm text-muted">
        Opsionale. Foto e gjerë, 5:2. Rekomandohet 2700 × 1080 px. JPEG, PNG ose WebP, deri në 8 MB.
        Pa të, karta përdor foton e një produkti.
      </p>
      <div
        className={`relative mt-3 w-full max-w-md ${reading ? "cursor-wait" : ""}`}
        {...drop.dropProps}
      >
        <Tooltip content={replaceLabel}>
          <button
            type="button"
            disabled={disabled || reading}
            aria-label={replaceLabel}
            className={`relative block aspect-[5/2] w-full cursor-pointer overflow-hidden rounded-2xl disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${fileDropZoneClass(drop.active)}`}
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            {drop.active ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-accent/10 text-sm font-bold text-ink"
              >
                {DROP_HERE_LABEL}
              </span>
            ) : null}
            {previewUrl ? (
              // Native img: the preview is a local blob or an already-hosted flyer file.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <span className="grid size-full place-items-center text-sm font-semibold text-muted">
                <PhotoCameraOutlinedIcon sx={{ fontSize: 28 }} />
                5:2
              </span>
            )}
            {previewUrl ? (
              <span className="pointer-events-none absolute right-2 bottom-2 grid size-8 place-items-center rounded-full bg-charcoal text-accent ring-2 ring-elevated">
                <PhotoCameraOutlinedIcon sx={{ fontSize: 18 }} />
              </span>
            ) : null}
          </button>
        </Tooltip>
        {previewUrl ? (
          <Tooltip content="Hiq imazhin e fletushkës">
            <button
              type="button"
              disabled={disabled || reading}
              aria-label="Hiq imazhin e fletushkës"
              className="absolute -top-1.5 -right-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-elevated text-danger ring-2 ring-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-60"
              onClick={() => {
                setError(null);
                onClear();
              }}
            >
              <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
            </button>
          </Tooltip>
        ) : null}
      </div>
      {error ? (
        <p className={`${fieldError} mt-2`} role="alert">
          {error}
        </p>
      ) : null}
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void onFile(file);
        }}
      />
    </div>
  );
}
