"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import type { MouseEvent } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import type { FavoriteKind } from "@/lib/favorites";

type FavoriteButtonProps = {
  kind: FavoriteKind;
  id: string;
  size?: "sm" | "md";
  className?: string;
  /** Dark glass chip for photos on forest / product media. */
  tone?: "on-media" | "on-surface";
};

export function FavoriteButton({
  kind,
  id,
  size = "sm",
  className = "",
  tone = "on-media",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(kind, id);
  const dim = size === "md" ? "size-11" : "size-9";
  const iconSize = size === "md" ? "medium" : "small";

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(kind, id);
  }

  return (
    <button
      type="button"
      aria-label={active ? "Hiq nga të preferuarat" : "Shto te të preferuarat"}
      aria-pressed={active}
      title={active ? "Hiq nga të preferuarat" : "Shto te të preferuarat"}
      onClick={onClick}
      className={[
        "inline-flex cursor-pointer items-center justify-center rounded-full border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
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
