"use client";

import { AddPhotoAlternateOutlinedIcon } from "@/components/ui/icons";
import { useRef, useState } from "react";
import { flyerImageFileError, readImageSize } from "@/features/offers/flyerImageFile";
import { DROP_HERE_LABEL, fileDropZoneClass, useFileDrop } from "@/hooks/useFileDrop";
import { fieldError } from "@/lib/ui";

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
      <div className="mt-3 flex items-center gap-3">
        <div className={`relative ${reading ? "cursor-wait" : ""}`} {...drop.dropProps}>
          <button
            type="button"
            disabled={disabled || reading}
            aria-label={replaceLabel}
            title={replaceLabel}
            className={`relative grid size-16 cursor-pointer place-items-center overflow-hidden rounded-2xl text-muted disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:size-[4.75rem] ${fileDropZoneClass(drop.active)}`}
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            {previewUrl ? (
              // Native img: the preview is a local blob or an already-hosted flyer file.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <AddPhotoAlternateOutlinedIcon fontSize="small" />
            )}
            {drop.active ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 grid place-items-center bg-accent/10 px-1 text-center text-[10px] font-bold leading-tight text-ink"
              >
                {DROP_HERE_LABEL}
              </span>
            ) : null}
          </button>
        </div>
        {previewUrl ? (
          <button
            type="button"
            disabled={disabled || reading}
            className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-danger hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-60"
            onClick={() => {
              setError(null);
              onClear();
            }}
          >
            Hiq imazhin
          </button>
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
