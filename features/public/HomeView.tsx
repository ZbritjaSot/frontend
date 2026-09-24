import {
  byDiscount,
  endingSoon,
  uniqueShops,
} from "@/features/public/compose";
import { Frame } from "@/features/public/Frame";
import { CampaignSection } from "@/features/public/home/CampaignSection";
import { CatalogSection } from "@/features/public/home/CatalogSection";
import { HeroSection } from "@/features/public/home/HeroSection";
import { ShopDirectory } from "@/features/public/home/ShopDirectory";
import { SpotlightSection } from "@/features/public/home/SpotlightSection";
import type { CategorySummary, PublicFolder, PublicOffer } from "@/types";

type HomeViewProps = {
  folders: PublicFolder[];
  offers: PublicOffer[];
  categories: CategorySummary[];
};

export function HomeView({ folders, offers, categories }: HomeViewProps) {
  const ranked = byDiscount(offers);
  const hero = ranked[0] ?? null;
  const spotlight = ranked.slice(1, 5);
  const shown = new Set<string>(spotlight.map((offer) => offer.id));
  if (hero) {
    shown.add(hero.id);
  }
  const latest = offers.filter((offer) => !shown.has(offer.id)).slice(0, 4);
  const soon = endingSoon(offers)
    .filter((offer) => !shown.has(offer.id) && !latest.some((item) => item.id === offer.id))
    .slice(0, 3);
  const shops = uniqueShops(folders);

  return (
    <>
      <HeroSection categories={categories} hero={hero} />

      {offers.length === 0 && folders.length === 0 ? (
        <Frame className="pt-4 pb-16">
          <p className="m-0 max-w-lg text-lg leading-relaxed text-muted">
            Momentalisht nuk ka zbritje publike. Ofertat e skaduara hiqen vetë
            nga lista.
          </p>
        </Frame>
      ) : null}

      <SpotlightSection offers={spotlight} />
      <CampaignSection folders={folders} />
      <CatalogSection latest={latest} soon={soon} />
      <ShopDirectory shops={shops} />
    </>
  );
}
