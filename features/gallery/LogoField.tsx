"use client";

import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { useRef, useState } from "react";
import { ShopLogo } from "@/features/public/visuals";
import { validationMessage } from "@/lib/api";
import { fieldError } from "@/lib/ui";

export function LogoField({
  name,
  logoUrl,
  onUpload,
  onRemove,
}: {
  name: string;
  logoUrl?: string | null;
  pending?: boolean;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) {
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

  return (
    <div className="relative grid justify-items-start gap-2">
      <div className="relative">
        <button
          type="button"
          disabled={busy}
          aria-label={logoUrl ? "Ndërro logon" : "Ngarko logon"}
          className="rounded-[1.25rem] disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
        >
          <ShopLogo name={name} logoUrl={logoUrl} size="lg" />
          <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-charcoal text-accent ring-2 ring-elevated">
            <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
          </span>
        </button>
        {logoUrl ? (
          <button
            type="button"
            disabled={busy}
            aria-label="Hiq logon"
            className="absolute -top-1 -left-1 grid size-6 place-items-center rounded-full bg-charcoal text-white ring-2 ring-elevated"
            onClick={async () => {
              setError(null);
              setBusy(true);
              try {
                await onRemove();
              } catch (caught) {
                setError(validationMessage(caught, "Logoja nuk u hoq."));
              } finally {
                setBusy(false);
              }
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
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
