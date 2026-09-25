import { CampaignGrid, CampaignPoster, CampaignRail } from "@/features/public/CampaignPoster";
import { DiscoverForm } from "@/features/public/DiscoverForm";
import { Band, EmptyNote, Pager, SectionHeading } from "@/features/public/Frame";
import { ProductGrid } from "@/features/public/ProductPoster";
import { display, kicker as kickerClass } from "@/features/public/tone";
import { browsePath, type Katalog } from "@/lib/browse";
import type { CategorySummary, PublicFolder, PublicOffer } from "@/types";

type ResultsViewProps = {
  folders: PublicFolder[];
  offers: PublicOffer[];
  categories: CategorySummary[];
  q: string;
  category?: string;
  katalog?: Katalog;
  page: number;
  offerLastPage: number;
  folderLastPage: number;
  offerTotal?: number;
  folderTotal?: number;
  basePath?: string;
};

export function ResultsView({
  folders,
  offers,
  categories,
  q,
  category,
  katalog,
  page,
  offerLastPage,
  folderLastPage,
  offerTotal = offers.length,
  folderTotal = folders.length,
  basePath = "/",
}: ResultsViewProps) {
  const categoryName = categories.find((item) => item.slug === category)?.name;
  const title = q
    ? `«${q}»`
    : katalog === "fletushka"
      ? "Fletushkat"
      : (categoryName ?? "Zbritjet");
  const kicker = katalog === "fletushka" ? "Katalogu" : q ? "Kërkimi" : "Katalogu";
  const flyerCatalogue = katalog === "fletushka";
  const showFlyerGrid = flyerCatalogue;
  const showFlyerRail = !flyerCatalogue && page === 1 && folders.length > 0;
  const showOffers = !flyerCatalogue && offers.length > 0;
  const empty = !showFlyerGrid && !showFlyerRail && !showOffers
    ? true
    : flyerCatalogue && folders.length === 0;
  const lastPage = flyerCatalogue
    ? folderLastPage
    : offers.length > 0 || offerLastPage > 1
      ? offerLastPage
      : folderLastPage;

  return (
    <Band className="pt-8">
      <p className={kickerClass}>{kicker}</p>
      <h1 className={`m-0 mt-2 max-w-4xl text-[clamp(2.4rem,6vw,4rem)] ${display}`}>
        {title}
      </h1>
      <p className="mt-4 mb-0 max-w-xl text-sm leading-relaxed text-muted">
        {flyerCatalogue
          ? `${folderTotal} fletushka aktive. Renditur sipas datës së fillimit.`
          : q
            ? `${offerTotal} produkte · ${folderTotal} fletushka`
            : `${offerTotal} produkte aktive${categoryName ? ` te ${categoryName}` : ""}.`}
      </p>
      <div className="mt-8 max-w-xl">
        <DiscoverForm
          basePath={basePath}
          q={q}
          category={category}
          katalog={katalog}
          categories={categories}
        />
      </div>

      {showFlyerRail ? (
        <div className="mt-12">
          <SectionHeading kicker="Fushata" title="Fletushkat" />
          <CampaignRail folders={folders} eager={page === 1} />
        </div>
      ) : null}

      {showFlyerGrid && folders.length > 0 ? (
        <div className="mt-12 grid gap-4">
          <CampaignPoster folder={folders[0]} layout="feature" eager={page === 1} />
          <CampaignGrid folders={folders.slice(1)} />
        </div>
      ) : null}

      {showOffers ? (
        <div className="mt-12">
          {showFlyerRail ? (
            <SectionHeading kicker="Produkte" title="Zbritjet" />
          ) : null}
          <ProductGrid offers={offers} />
        </div>
      ) : null}

      {empty ? (
        <EmptyNote
          title="Nuk u gjet asgjë"
          body="Provo një fjalë tjetër, ose hiq kategorinë dhe shiko të gjitha ofertat."
        />
      ) : null}

      <Pager
        page={page}
        lastPage={lastPage}
        hrefFor={(next) => browsePath(basePath, { q, category, katalog, page: next })}
      />
    </Band>
  );
}
