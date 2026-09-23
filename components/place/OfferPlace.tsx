"use client";

import AppleIcon from "@mui/icons-material/Apple";
import GoogleIcon from "@mui/icons-material/Google";
import PlaceIcon from "@mui/icons-material/Place";
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
};

export function OfferPlace({
  name,
  place,
  className,
  showHeading = true,
  mapClassName,
}: OfferPlaceProps) {
  const wide = useWideScreen();
  const pinned = place.latitude != null && place.longitude != null;
  if (!place.address && !pinned) {
    return null;
  }

  return (
    <section
      className={`grid gap-3 rounded-2xl border border-line bg-elevated p-5 ${className ?? ""}`}
      aria-label="Vendndodhja"
    >
      {showHeading ? (
        <div>
          <p className="m-0 flex items-center gap-1 text-xs font-bold tracking-[0.14em] text-muted uppercase">
            <PlaceIcon className="text-[15px]!" fontSize="inherit" />
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
          <AppleIcon fontSize="small" />
          Apple Maps
        </a>
        <a
          className={`${btnGhost} px-2.5! text-sm! whitespace-nowrap`}
          href={googleMapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GoogleIcon fontSize="small" />
          Google Maps
        </a>
      </div>
    </section>
  );
}
