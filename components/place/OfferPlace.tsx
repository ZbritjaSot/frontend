"use client";

import { PlaceMap } from "@/components/place/PlaceMap";
import { appleMapsUrl, googleMapsUrl, type MapPlace } from "@/lib/maps";
import { btnGhost, btnPrimary } from "@/lib/ui";
import { useWideScreen } from "@/lib/useWideScreen";

type OfferPlaceProps = {
  name: string;
  place: MapPlace;
};

export function OfferPlace({ name, place }: OfferPlaceProps) {
  const wide = useWideScreen();
  const pinned = place.latitude != null && place.longitude != null;
  if (!place.address && !pinned) {
    return null;
  }

  return (
    <section className="mt-[1.75rem] grid gap-[0.65rem]" aria-label="Vendndodhja">
      <p className="m-0 text-xs tracking-[0.06em] text-muted uppercase">
        Ku e gjen
      </p>
      <h2 className="m-0 text-[1.15rem]">{name}</h2>
      {place.address ? (
        <p className="m-0 text-muted">{place.address}</p>
      ) : null}
      {pinned && wide ? (
        <div className="h-60 overflow-hidden rounded-[14px] border border-line">
          <PlaceMap
            latitude={place.latitude ?? null}
            longitude={place.longitude ?? null}
            label={name}
          />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <a
          className={btnGhost}
          href={appleMapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Apple Maps
        </a>
        <a
          className={btnPrimary}
          href={googleMapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Maps
        </a>
      </div>
    </section>
  );
}
