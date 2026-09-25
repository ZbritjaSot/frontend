import { Frame } from "@/features/public/Frame";
import { CampaignSection } from "@/features/public/home/CampaignSection";
import { CatalogSection } from "@/features/public/home/CatalogSection";
import { CategoryBand } from "@/features/public/home/CategoryBand";
import { DiscoverBand } from "@/features/public/home/DiscoverBand";
import { HeroSection } from "@/features/public/home/HeroSection";
import { ShopDirectory } from "@/features/public/home/ShopDirectory";
import { SpotlightSection } from "@/features/public/home/SpotlightSection";
import type { PublicHome } from "@/features/offers/api";

export function HomeView({ home }: { home: PublicHome }) {
  const empty =
    home.hero === null &&
    home.featured.length === 0 &&
    home.flyers.length === 0 &&
    home.fresh.length === 0;

  return (
    <>
      <HeroSection hero={home.hero} />
      <DiscoverBand categories={home.categories} />
      {empty ? (
        <Frame className="pt-6 pb-10">
          <p className="m-0 max-w-lg text-base leading-relaxed text-muted">
            Momentalisht nuk ka zbritje publike. Ofertat e skaduara hiqen vetë nga lista.
          </p>
        </Frame>
      ) : null}
      <SpotlightSection offers={home.featured} />
      <CampaignSection folders={home.flyers} />
      <CategoryBand categories={home.categories} />
      <CatalogSection latest={home.fresh} soon={home.ending_soon} />
      <ShopDirectory shops={home.shops} />
    </>
  );
}
