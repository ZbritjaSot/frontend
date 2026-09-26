"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  deleteBizGallery,
  fetchBizGallery,
  uploadBizGallery,
} from "@/features/gallery/api";
import { bizGalleryQueryKey } from "@/features/gallery/ItemPhoto";
import { validationMessage } from "@/lib/api";
import { fieldError } from "@/lib/ui";

export function BizGallery() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const gallery = useQuery({
    queryKey: bizGalleryQueryKey,
    queryFn: fetchBizGallery,
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: bizGalleryQueryKey });
  }

  return (
    <div className="grid gap-3">
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
      <ul className="m-0 grid list-none grid-cols-4 gap-2 p-0 sm:grid-cols-6 lg:grid-cols-8">
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
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) {
                return;
              }
              setError(null);
              setBusy(true);
              try {
                await uploadBizGallery(file);
                await refresh();
              } catch (caught) {
                setError(validationMessage(caught, "Fotoja nuk u ngarkua."));
              } finally {
                setBusy(false);
              }
            }}
          />
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
              className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-elevated text-danger ring-2 ring-elevated"
              onClick={async () => {
                setError(null);
                setBusy(true);
                try {
                  await deleteBizGallery(image.id);
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
  );
}
