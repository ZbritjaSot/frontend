import { Frame } from "@/features/public/Frame";
import { OfferRow, ProductPoster } from "@/features/public/ProductPoster";
import type { PublicOffer } from "@/types";

export function CatalogSection({
  latest,
  soon,
}: {
  latest: PublicOffer[];
  soon: PublicOffer[];
}) {
  if (latest.length === 0 && soon.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-16 pb-8 sm:pt-24">
      <div
        className={
          soon.length > 0
            ? "grid items-start gap-14 lg:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.55fr)] lg:gap-16"
            : ""
        }
      >
        {latest.length > 0 ? (
          <div>
            <h2 className="m-0 text-[clamp(1.7rem,3vw,2.3rem)] leading-none font-extrabold tracking-[-0.04em]">
              Sapo u shtuan
            </h2>
            <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-x-4 gap-y-10 p-0 sm:gap-x-6">
              {latest.map((offer) => (
                <li key={offer.id}>
                  <ProductPoster offer={offer} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {soon.length > 0 ? (
          <div>
            <h2 className="m-0 text-sm font-semibold text-muted">
              Mbaron së shpejti
            </h2>
            <ul className="m-0 mt-4 list-none p-0">
              {soon.map((offer) => (
                <li key={offer.id} className="border-t border-line">
                  <OfferRow offer={offer} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Frame>
  );
}
