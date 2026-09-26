import { Frame } from "@/features/public/Frame";
import { CampaignSection } from "@/features/public/home/CampaignSection";
import { CatalogSection } from "@/features/public/home/CatalogSection";
import { CategoryBand } from "@/features/public/home/CategoryBand";
import { DiscoverBand } from "@/features/public/home/DiscoverBand";
import { ExclusiveBand } from "@/features/public/home/ExclusiveBand";
import { HeroSection } from "@/features/public/home/HeroSection";
import { ShopDirectory } from "@/features/public/home/ShopDirectory";
import { InboxBand } from "@/features/public/home/InboxBand";
import { SpotlightSection } from "@/features/public/home/SpotlightSection";
import type { PublicHome } from "@/features/offers/api";
import { defaultHomeSections, type HomeSection } from "@/lib/homeSections";

export function HomeView({ home }: { home: PublicHome }) {
  const empty =
    home.hero === null &&
    home.featured.length === 0 &&
    home.flyers.length === 0 &&
    home.fresh.length === 0;
  const sections = home.sections?.length ? home.sections : defaultHomeSections;

  return (
    <>
      <HeroSection offers={home.heroes} />
      <DiscoverBand categories={home.categories} />
      {empty ? (
        <Frame className="pt-6 pb-10">
          <p className="m-0 max-w-lg text-base leading-relaxed text-muted">
            Momentalisht nuk ka zbritje publike. Ofertat e skaduara hiqen vetë nga lista.
          </p>
        </Frame>
      ) : null}
      {sections.map((section) => (
        <HomeBlock key={section.key} section={section} home={home} />
      ))}
    </>
  );
}

function HomeBlock({ section, home }: { section: HomeSection; home: PublicHome }) {
  switch (section.key) {
    case "exclusive":
      return <ExclusiveBand items={home.exclusive} title={section.title} />;
    case "spotlight":
      return <SpotlightSection offers={home.featured} title={section.title} />;
    case "flyers":
      return <CampaignSection folders={home.flyers} title={section.title} />;
    case "inbox":
      return <InboxBand home={home} title={section.title} />;
    case "categories":
      return <CategoryBand categories={home.categories} title={section.title} />;
    case "fresh":
      return <CatalogSection latest={home.fresh} soon={[]} freshTitle={section.title} />;
    case "ending":
      return (
        <CatalogSection latest={[]} soon={home.ending_soon} endingTitle={section.title} />
      );
    case "shops":
      return <ShopDirectory shops={home.shops} title={section.title} />;
    default:
      return null;
  }
}
