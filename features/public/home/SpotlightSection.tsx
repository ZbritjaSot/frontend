import { Frame, SeeAll } from "@/features/public/Frame";
import { ProductGrid } from "@/features/public/ProductPoster";
import { kicker } from "@/features/public/tone";
import type { PublicOffer } from "@/types";

export function SpotlightSection({ offers }: { offers: PublicOffer[] }) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-10 sm:pt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={kicker}>Përzgjedhje</p>
          <h2 className="m-0 mt-1 text-2xl leading-none font-extrabold tracking-[-0.04em] sm:text-3xl">
            Zbritje të forta
          </h2>
        </div>
        <SeeAll href="/?katalog=oferta">Shiko të gjitha</SeeAll>
      </div>
      <ProductGrid offers={offers} eager />
    </Frame>
  );
}
