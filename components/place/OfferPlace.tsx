"use client";

import { PlaceMap } from "@/components/place/PlaceMap";
import { appleMapsUrl, googleMapsUrl, type MapPlace } from "@/lib/maps";
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
      <div className="grid grid-cols-2 gap-2">
        <a
          className={`${btnGhost} px-2.5! text-sm! whitespace-nowrap`}
          href={appleMapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Apple Maps
        </a>
        <a
          className={`${btnGhost} px-2.5! text-sm! whitespace-nowrap`}
          href={googleMapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748L12.545 10.239z" />
          </svg>
          Google Maps
        </a>
      </div>
    </section>
  );
}
