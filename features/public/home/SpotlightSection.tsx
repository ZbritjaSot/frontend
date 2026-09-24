import { Frame } from "@/features/public/Frame";
import { ProductPoster } from "@/features/public/ProductPoster";
import type { PublicOffer } from "@/types";

export function SpotlightSection({ offers }: { offers: PublicOffer[] }) {
  if (offers.length < 2) {
    return null;
  }

  return (
    <Frame className="pt-14 pb-2 sm:pt-16">
      <h2 className="m-0 text-[clamp(1.7rem,3vw,2.3rem)] leading-none font-extrabold tracking-[-0.04em]">
        Zbritje të forta
      </h2>
      <div className="-mx-5 mt-8 flex snap-x snap-proximity gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="w-[68vw] max-w-[16rem] shrink-0 snap-start sm:w-60 lg:w-auto lg:max-w-none"
          >
            <ProductPoster offer={offer} />
          </div>
        ))}
      </div>
    </Frame>
  );
}
