"use client";

import { PlaceMap } from "@/components/place/PlaceMap";
import { mapsUrl, type MapPlace } from "@/lib/maps";
import { btnGhost } from "@/lib/ui";
import { useWideScreen } from "@/lib/useWideScreen";

type OfferPlaceProps = {
  name: string;
  place: MapPlace;
  className?: string;
  /** Shop page already shows the name and address. */
  showHeading?: boolean;
  mapClassName?: string;
  /** `plain` drops the boxed panel so the map can sit in a page section. */
  surface?: "card" | "plain";
};

export function OfferPlace({
  name,
  place,
  className,
  showHeading = true,
  mapClassName,
  surface = "card",
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
        <div>
          <p className="m-0 flex items-center gap-1 text-xs font-bold tracking-[0.14em] text-muted uppercase">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[15px] fill-current">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5" />
            </svg>
            Ku e gjen
          </p>
          <h2 className="m-0 mt-2 text-lg font-semibold">{name}</h2>
          {place.address ? (
            <p className="m-0 mt-1 text-sm leading-relaxed text-muted">
              {place.address}
            </p>
          ) : null}
        </div>
      ) : null}
      {pinned && wide ? (
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
      <a
        className={`${btnGhost} w-full px-2.5! text-sm!`}
        href={mapsUrl({ ...place, address: place.address ?? name })}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5" />
        </svg>
        Shiko lokacionin
      </a>
    </section>
  );
}
