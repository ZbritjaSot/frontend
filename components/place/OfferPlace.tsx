"use client";

import { PlaceMap } from "@/components/place/PlaceMap";
import { appleMapsUrl, googleMapsUrl, type MapPlace } from "@/lib/maps";
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
    <section
      className={pinned ? "place-card place-card--pinned" : "place-card"}
      aria-label="Vendndodhja"
    >
      <p className="place-card__kicker">Ku e gjen</p>
      <h2 className="place-card__title">{name}</h2>
      {place.address ? (
        <p className="place-card__address">{place.address}</p>
      ) : null}
      {pinned && wide ? (
        <div className="place-card__map">
          <PlaceMap
            latitude={place.latitude ?? null}
            longitude={place.longitude ?? null}
            label={name}
          />
        </div>
      ) : null}
      <div className="place-card__apps">
        <a
          className="btn btn--ghost"
          href={appleMapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Apple Maps
        </a>
        <a
          className="btn btn--primary"
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
