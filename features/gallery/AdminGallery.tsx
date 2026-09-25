"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  deleteAdminGallery,
  fetchAdminGallery,
  uploadAdminGallery,
} from "@/features/gallery/api";
import { validationMessage } from "@/lib/api";
import { fieldError } from "@/lib/ui";

function galleryKey(businessId: string) {
  return ["admin", "gallery", businessId] as const;
}

export function AdminGallery({ businessId }: { businessId: string }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const gallery = useQuery({
    queryKey: galleryKey(businessId),
    queryFn: () => fetchAdminGallery(businessId),
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: galleryKey(businessId) });
  }

  return (
    <div className="grid gap-2">
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
      <ul className="m-0 grid list-none grid-cols-4 gap-2 p-0">
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
        </li>
        {gallery.data?.map((image) => (
          <li key={image.id} className="relative">
            <span className="relative block aspect-square overflow-hidden rounded-xl">
              <Image
                src={image.thumb_url}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="120px"
              />
            </span>
            <button
              type="button"
              disabled={busy}
              aria-label="Hiq foton"
              className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-charcoal text-white ring-2 ring-elevated"
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
              <CloseIcon sx={{ fontSize: 14 }} />
            </button>
          </li>
        ))}
      </ul>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) {
            return;
          }
          setError(null);
          setBusy(true);
          try {
            await uploadAdminGallery(businessId, file);
            await refresh();
          } catch (caught) {
            setError(validationMessage(caught, "Fotoja nuk u ngarkua."));
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
