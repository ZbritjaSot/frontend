import Link from "next/link";
import { mapsUrl } from "@/lib/maps";
import { ShopLogo } from "@/features/public/visuals";
import type { BusinessSummary } from "@/types";

type BranchPlacesProps = {
  places: BusinessSummary[] | undefined;
};

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className ?? "size-[14px] fill-current"}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5" />
    </svg>
  );
}

export function BranchPlaces({ places }: BranchPlacesProps) {
  if (!places || places.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 grid gap-6">
      <div>
        <p className="m-0 text-[0.7rem] font-bold tracking-[0.18em] text-muted uppercase">
          Degë të tjera
        </p>
        <h2 className="m-0 mt-2 text-2xl font-extrabold tracking-tight">
          E njëjta ofertë
        </h2>
      </div>
      <ul className="m-0 grid list-none gap-2 p-0">
        {places.map((place) => {
          const address = place.address?.trim() || null;
          const mapsHref = mapsUrl({
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
          });
          const canMap =
            Boolean(address) ||
            (place.latitude != null && place.longitude != null);

          return (
            <li
              key={place.id}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-elevated px-3 py-2.5 dark:border-white/10"
            >
              <Link
                href={`/biznese/${place.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 underline-offset-4 hover:underline"
              >
                <ShopLogo name={place.name} logoUrl={place.logo_url} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-extrabold tracking-tight text-ink">
                    {place.name}
                  </span>
                  {address ? (
                    <span className="text-muted"> · {address}</span>
                  ) : null}
                </span>
              </Link>
              {canMap ? (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Shiko lokacionin: ${address ?? place.name}`}
                  className="inline-grid size-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <PinIcon />
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
