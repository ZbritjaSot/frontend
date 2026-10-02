import Link from "next/link";
import { mapsUrl } from "@/lib/maps";
import { ShopLogo } from "@/features/public/visuals";
import type { BusinessSummary } from "@/types";

type BranchPlacesProps = {
  places: BusinessSummary[] | undefined;
  /** Second headline under “Degë të tjera”. Flyer default: same offer elsewhere. */
  title?: string;
  /** When false, only the list is rendered (parent already has a section intro). */
  showHeading?: boolean;
  className?: string;
};

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className ?? "size-[14px] fill-current"}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5" />
    </svg>
  );
}

function placeRole(place: Pick<BusinessSummary, "parent_id">): string {
  return place.parent_id ? "Degë" : "Dyqani kryesor";
}

export function PlaceBranchRow({
  place,
  linked = true,
  tone = "default",
  className,
}: {
  place: BusinessSummary;
  /** When false, the row is the shop you are already on — no self-link. */
  linked?: boolean;
  /** Soft bar for forest / dark hero surfaces. */
  tone?: "default" | "onForest";
  className?: string;
}) {
  const address = place.address?.trim() || null;
  const role = placeRole(place);
  const mapsHref = mapsUrl({
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
  });
  const canMap =
    Boolean(address) || (place.latitude != null && place.longitude != null);
  const onForest = tone === "onForest";
  const nameClass = onForest
    ? "block truncate text-sm font-extrabold tracking-tight text-ivory"
    : "block truncate text-sm font-extrabold tracking-tight text-ink";
  const metaClass = onForest
    ? "block truncate text-xs text-ivory/70"
    : "block truncate text-xs text-muted";
  const shellClass = onForest
    ? "flex min-w-0 items-center gap-3 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2.5"
    : "flex min-w-0 items-center gap-3 rounded-xl border border-line bg-elevated px-3 py-2.5 dark:border-white/10";

  const body = (
    <>
      <ShopLogo name={place.name} logoUrl={place.logo_url} size="sm" />
      <span className="min-w-0 flex-1">
        <span className={nameClass}>{place.name}</span>
        <span className={metaClass}>
          {address ? `${role} · ${address}` : role}
        </span>
      </span>
    </>
  );

  return (
    <div className={`${shellClass} ${className ?? ""}`.trim()}>
      {linked ? (
        <Link
          href={`/biznese/${place.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 underline-offset-4 hover:underline"
        >
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
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
    </div>
  );
}

export function BranchPlaces({
  places,
  title = "E njëjta ofertë",
  showHeading = true,
  className,
}: BranchPlacesProps) {
  if (!places || places.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-3 ${className ?? ""}`.trim()}>
      {showHeading ? (
        <div>
          <p className="m-0 text-[0.7rem] font-bold tracking-[0.18em] text-muted uppercase">
            Degë të tjera
          </p>
          <h2 className="m-0 mt-1 text-[clamp(1.65rem,3vw,2.35rem)] leading-[0.95] font-extrabold tracking-[-0.04em]">
            {title}
          </h2>
        </div>
      ) : null}
      <ul className="m-0 grid list-none gap-2 p-0">
        {places.map((place) => (
          <li key={place.id}>
            <PlaceBranchRow place={place} />
          </li>
        ))}
      </ul>
    </div>
  );
}
