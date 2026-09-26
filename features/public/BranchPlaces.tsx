import Link from "next/link";
import { OfferPlace } from "@/components/place/OfferPlace";
import type { BusinessSummary } from "@/types";

type BranchPlacesProps = {
  places: BusinessSummary[] | undefined;
};

export function BranchPlaces({ places }: BranchPlacesProps) {
  if (!places || places.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 grid gap-8">
      <div>
        <p className="m-0 text-[0.7rem] font-bold tracking-[0.18em] text-muted uppercase">
          Degë të tjera
        </p>
        <h2 className="m-0 mt-2 text-2xl font-extrabold tracking-tight">
          E njëjta ofertë
        </h2>
      </div>
      <ul className="m-0 grid list-none gap-8 p-0">
        {places.map((place) => (
          <li key={place.id} className="max-w-xl">
            <Link
              href={`/biznese/${place.id}`}
              className="text-lg font-extrabold tracking-tight underline-offset-4 hover:underline"
            >
              {place.name}
            </Link>
            <div className="mt-3">
              <OfferPlace
                surface="plain"
                showHeading={false}
                mapClassName="h-56 rounded-[1.5rem]"
                name={place.name}
                place={{
                  address: place.address,
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
