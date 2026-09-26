"use client";

import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  fetchManagerGallery,
  uploadManagerGallery,
} from "@/features/biz/managerApi";
import {
  fetchAdminGallery,
  fetchBizGallery,
  uploadAdminGallery,
  uploadBizGallery,
} from "@/features/gallery/api";
import { validationMessage } from "@/lib/api";
import { fieldError } from "@/lib/ui";
import type { OfferImage } from "@/types";

export const bizGalleryQueryKey = ["biz", "gallery"] as const;

export function ItemPhoto({
  name,
  thumbUrl,
  businessId,
  gallery = "biz",
  disabled,
  onPick,
  onClear,
}: {
  name: string;
  thumbUrl?: string | null;
  /** When set, photos come from that shop's gallery instead of the signed-in shop. */
  businessId?: string;
  gallery?: "biz" | "admin" | "manager";
  disabled?: boolean;
  onPick: (image: OfferImage) => void;
  onClear: () => void;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const galleryKey =
    gallery === "manager" && businessId
      ? (["biz", "review", "gallery", businessId] as const)
      : businessId && gallery === "admin"
        ? (["admin", "gallery", businessId] as const)
        : bizGalleryQueryKey;
  const photos = useQuery({
    queryKey: galleryKey,
    queryFn: () => {
      if (gallery === "manager" && businessId) {
        return fetchManagerGallery(businessId);
      }
      if (gallery === "admin" && businessId) {
        return fetchAdminGallery(businessId);
      }
      return fetchBizGallery();
    },
    enabled: open,
  });

  function close() {
    setOpen(false);
    setError(null);
  }

  async function upload(file: File | undefined) {
    if (!file) {
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const image =
        gallery === "manager" && businessId
          ? await uploadManagerGallery(businessId, file)
          : gallery === "admin" && businessId
            ? await uploadAdminGallery(businessId, file)
            : await uploadBizGallery(file);
      await queryClient.invalidateQueries({ queryKey: galleryKey });
      onPick(image);
      close();
    } catch (caught) {
      setError(validationMessage(caught, "Fotoja nuk u ngarkua."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative size-16 shrink-0 sm:size-[4.75rem]">
      <button
        type="button"
        disabled={disabled || busy}
        aria-label={thumbUrl ? `Ndërro foton e ${name || "produktit"}` : "Shto foto"}
        className="relative grid size-full place-items-center overflow-hidden rounded-2xl border border-line bg-sunken text-muted disabled:opacity-60"
        onClick={() => setOpen(true)}
      >
        {thumbUrl ? (
          <Image src={thumbUrl} alt="" fill unoptimized className="object-cover" sizes="76px" />
        ) : (
          <ImageOutlinedIcon fontSize="small" />
        )}
      </button>
      {thumbUrl ? (
        <button
          type="button"
          disabled={disabled || busy}
          aria-label="Hiq foton"
          className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-charcoal text-white ring-2 ring-elevated"
          onClick={onClear}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </button>
      ) : null}
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void upload(file);
        }}
      />
      <Modal
        open={open}
        title="Foto e produktit"
        size="md"
        onClose={close}
      >
        {error ? (
          <p className={`${fieldError} mb-3`} role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          disabled={busy}
          className="mb-4 flex min-h-12 w-full items-center gap-3 rounded-xl border border-dashed border-line px-3 text-left font-semibold text-ink hover:bg-sunken disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
        >
          <AddPhotoAlternateOutlinedIcon fontSize="small" />
          Ngarko foto
        </button>
        <p className="m-0 mb-2 text-xs font-bold tracking-[0.08em] text-muted uppercase">
          Galeria
        </p>
        {photos.isError ? (
          <p className={fieldError} role="alert">
            {validationMessage(photos.error, "Galeria nuk u ngarkua.")}
          </p>
        ) : photos.data && photos.data.length > 0 ? (
          <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0">
            {photos.data.map((image) => (
              <li key={image.id}>
                <button
                  type="button"
                  className="relative block aspect-square w-full overflow-hidden rounded-xl"
                  onClick={() => {
                    onPick(image);
                    close();
                  }}
                >
                  <Image
                    src={image.thumb_url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="120px"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-sm text-muted">Nuk ka foto ende. Ngarko të parën.</p>
        )}
      </Modal>
    </div>
  );
}
