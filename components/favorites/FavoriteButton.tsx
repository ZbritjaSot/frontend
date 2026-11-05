"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useToast } from "@/components/ui/Toast";
import { useFavorites } from "@/hooks/useFavorites";
import type { FavoriteKind } from "@/lib/favorites";

type FavoriteButtonProps = {
  kind: FavoriteKind;
  id: string;
  size?: "sm" | "md";
  className?: string;
  /** Dark glass chip for photos on forest / product media. */
  tone?: "on-media" | "on-surface";
  /** Thumbnail shown on the add/remove toast. Both are optional — items
   * without a photo still get the toast's name-hashed fallback. */
  thumbnailUrl?: string | null;
  thumbnailName?: string;
};

export function FavoriteButton({
  kind,
  id,
  size = "sm",
  className = "",
  tone = "on-media",
  thumbnailUrl,
  thumbnailName,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(kind, id);
  const dim = size === "md" ? "size-11" : "size-9";
  const iconSize = size === "md" ? "medium" : "small";
  const router = useRouter();
  const { showToast } = useToast();

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const nowActive = toggleFavorite(kind, id);
    const thumbnail = thumbnailName ? { url: thumbnailUrl, name: thumbnailName } : undefined;
    if (nowActive) {
      showToast("U shtua te të preferuarat", {
        tone: "success",
        action: { label: "Shiko", onClick: () => router.push("/preferuarat") },
        key: "favorite",
        thumbnail,
      });
    } else {
      showToast("U hoq nga të preferuarat", { tone: "success", key: "favorite", thumbnail });
    }
  }

  return (
    <button
      type="button"
      aria-label={active ? "Hiq nga të preferuarat" : "Shto te të preferuarat"}
      aria-pressed={active}
      title={active ? "Hiq nga të preferuarat" : "Shto te të preferuarat"}
      onClick={onClick}
      className={[
        "inline-flex cursor-pointer items-center justify-center rounded-full border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        dim,
        tone === "on-media"
          ? "bg-charcoal/45 text-ivory backdrop-blur-sm hover:bg-charcoal/60"
          : "border border-line bg-elevated text-ink hover:bg-hover",
        active ? "text-[#ff6b7a]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {active ? (
        <FavoriteIcon fontSize={iconSize} className="text-[#ff6b7a]" />
      ) : (
        <FavoriteBorderIcon fontSize={iconSize} />
      )}
    </button>
  );
}
