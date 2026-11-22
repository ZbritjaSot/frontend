"use client";

import { DeleteOutlinedIcon, PhotoCameraOutlinedIcon } from "@/components/ui/icons";
import { useRef, useState } from "react";
import { ShopLogo } from "@/features/public/visuals";
import { DROP_HERE_LABEL, useFileDrop } from "@/hooks/useFileDrop";
import { validationMessage } from "@/lib/api";
import { fieldError } from "@/lib/ui";

export function LogoField({
  name,
  logoUrl,
  readOnly = false,
  onUpload,
  onRemove,
}: {
  name: string;
  logoUrl?: string | null;
  pending?: boolean;
  readOnly?: boolean;
  onUpload?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file || !onUpload) {
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onUpload(file);
    } catch (caught) {
      setError(validationMessage(caught, "Logoja nuk u ngarkua."));
    } finally {
      setBusy(false);
    }
  }

  const drop = useFileDrop({
    disabled: busy || readOnly,
    onFiles: (files, rejection) => {
      if (files.length === 0) {
        if (rejection) {
          setError(rejection);
        }
        return;
      }
      if (rejection) {
        setError(rejection);
      }
      void onFile(files[0]);
    },
  });

  if (readOnly) {
    return <ShopLogo name={name} logoUrl={logoUrl} size="xl" />;
  }

  return (
    <div className="relative grid justify-items-start gap-2">
      <div className="relative" {...drop.dropProps}>
        <button
          type="button"
          disabled={busy}
          aria-label={logoUrl ? "Ndërro logon" : "Ngarko logon"}
          className={`relative rounded-hero disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
            drop.active ? "ring-2 ring-accent" : ""
          }`}
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          <ShopLogo name={name} logoUrl={logoUrl} size="xl" />
          {drop.active ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center rounded-hero bg-accent/10 px-1 text-center text-[10px] font-bold leading-tight text-ink"
            >
              {DROP_HERE_LABEL}
            </span>
          ) : null}
          <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-charcoal text-accent ring-2 ring-elevated">
            <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
          </span>
        </button>
        {logoUrl ? (
          <button
            type="button"
            disabled={busy}
            aria-label="Hiq logon"
            className="absolute -top-1 -left-1 grid size-6 place-items-center rounded-full bg-elevated text-danger ring-2 ring-elevated disabled:pointer-events-none"
            onClick={async () => {
              setError(null);
              setBusy(true);
              try {
                await onRemove?.();
              } catch (caught) {
                setError(validationMessage(caught, "Logoja nuk u hoq."));
              } finally {
                setBusy(false);
              }
            }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
          </button>
        ) : null}
      </div>
      {error ? (
        <p className={fieldError} role="alert">
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
