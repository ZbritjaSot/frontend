"use client";

import { PlaceMap } from "@/components/place/PlaceMap";
import { mapsUrl, type MapPlace } from "@/lib/maps";
import { useWideScreen } from "@/lib/useWideScreen";

type OfferPlaceProps = {
  name: string;
  place: MapPlace;
  className?: string;
  /** Shop page already shows the name and address. */
  showHeading?: boolean;
  /** Hide the compact address + pin bar (e.g. when a richer branch row is shown). */
  showPin?: boolean;
  mapClassName?: string;
  /** `plain` drops the boxed panel so the map can sit in a page section. */
  surface?: "card" | "plain";
  /** Hide the map; keep address + pin only. */
  showMap?: boolean;
};

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className ?? "size-4 fill-current"}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5" />
    </svg>
  );
}

type PlacePinRowProps = {
  name: string;
  place: MapPlace;
  className?: string;
  /** Soft bar for forest / dark hero surfaces. */
  tone?: "default" | "onForest";
  /** Tighter padding for inline placement under copy. */
  dense?: boolean;
};

/**
 * Compact location bar: address left (single-line ellipsis), lime pin on the right.
 * The whole row opens maps — the pin is the visual affordance, not a floating icon.
 */
export function PlacePinRow({
  name,
  place,
  className,
  tone = "default",
  dense = false,
}: PlacePinRowProps) {
  const pinned = place.latitude != null && place.longitude != null;
  if (!place.address && !pinned) {
    return null;
  }

  const label = place.address ?? name;
  const onForest = tone === "onForest";
  const pad = dense ? "px-3 py-2" : "px-3 py-2.5";

  return (
    <a
      className={
        onForest
          ? `group flex min-w-0 items-center gap-3 rounded-xl border border-white/12 bg-white/[0.06] ${pad} transition-colors hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className ?? ""}`
          : `group flex min-w-0 items-center gap-3 rounded-xl border border-line bg-elevated ${pad} transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-white/10 ${className ?? ""}`
      }
      href={mapsUrl({ ...place, address: place.address ?? name })}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Shiko lokacionin: ${label}`}
    >
      <span
        className={
          onForest
            ? "m-0 min-w-0 flex-1 truncate text-sm text-ivory/80"
            : "m-0 min-w-0 flex-1 truncate text-sm text-muted"
        }
      >
        {label}
      </span>
      <span
        className="inline-grid size-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-[0_1px_2px_rgba(11,15,14,0.12)] transition-transform duration-150 group-hover:scale-105"
        aria-hidden="true"
      >
        <PinIcon className="size-[14px] fill-current" />
      </span>
    </a>
  );
}

export function OfferPlace({
  name,
  place,
  className,
  showHeading = true,
  showPin = true,
  mapClassName,
  surface = "card",
  showMap = true,
}: OfferPlaceProps) {
  const wide = useWideScreen();
  const pinned = place.latitude != null && place.longitude != null;
  if (!place.address && !pinned) {
    return null;
  }

  return (
    <section
      className={`${
        surface === "plain"
          ? "grid gap-3"
          : "grid gap-3 rounded-2xl border border-line bg-elevated p-5"
      } ${className ?? ""}`}
      aria-label="Vendndodhja"
    >
      {showHeading ? (
        <p className="m-0 flex items-center gap-1 text-xs font-bold tracking-[0.14em] text-muted uppercase">
          <PinIcon className="size-[15px] fill-current" />
          Ku e gjen
        </p>
      ) : null}
      {showPin ? <PlacePinRow name={name} place={place} /> : null}
      {showMap && pinned && wide ? (
        <div
          className={`${mapClassName ?? "h-60"} overflow-hidden rounded-xl border border-line`}
        >
          <PlaceMap
            latitude={place.latitude ?? null}
            longitude={place.longitude ?? null}
            label={name}
          />
        </div>
      ) : null}
    </section>
  );
}
