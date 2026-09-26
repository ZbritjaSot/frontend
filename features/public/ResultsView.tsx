import Link from "next/link";
import { CatalogFilters } from "@/features/public/CatalogFilters";
import { CatalogStream } from "@/features/public/CatalogStream";
import { CampaignGrid, CampaignPoster, CampaignRail } from "@/features/public/CampaignPoster";
import { DiscoverForm } from "@/features/public/DiscoverForm";
import { Band, EmptyNote, Pager, SectionHeading } from "@/features/public/Frame";
import { ProductGrid } from "@/features/public/ProductPoster";
import { locationLabel } from "@/features/public/compose";
import { display, kicker as kickerClass } from "@/features/public/tone";
import { ShopLogo } from "@/features/public/visuals";
import { browsePath, type CatalogSort, type Katalog } from "@/lib/browse";
import type { CategorySummary, PublicBusiness, PublicFolder, PublicOffer } from "@/types";

type ResultsViewProps = {
  folders: PublicFolder[];
  offers: PublicOffer[];
  categories: CategorySummary[];
  q: string;
  category?: string;
  katalog?: Katalog;
  city?: string;
  sort?: CatalogSort;
  cities?: string[];
  page: number;
  offerLastPage: number;
  folderLastPage: number;
  offerTotal?: number;
  folderTotal?: number;
  shops?: PublicBusiness[];
  basePath?: string;
};

export function ResultsView({
  folders,
  offers,
  categories,
  q,
  category,
  katalog,
  city,
  sort = "newest",
  cities = [],
  page,
  offerLastPage,
  folderLastPage,
  offerTotal = offers.length,
  folderTotal = folders.length,
  shops = [],
  basePath = "/",
}: ResultsViewProps) {
  const categoryName = categories.find((item) => item.slug === category)?.name;
  const title = q
    ? `«${q}»`
    : katalog === "fletushka"
      ? "Fletushkat"
      : katalog === "oferta"
        ? (categoryName ?? "Ofertat")
        : (categoryName ?? "Zbritjet");
  const kicker = katalog === "fletushka" ? "Katalogu" : q ? "Kërkimi" : "Katalogu";
  const flyerCatalogue = katalog === "fletushka";
  const catalogue = katalog === "oferta" || katalog === "fletushka";
  const showFlyerGrid = flyerCatalogue;
  const showFlyerRail = !flyerCatalogue && page === 1 && folders.length > 0;
  const showOffers = !flyerCatalogue && offers.length > 0;
  const empty = shops.length === 0 && (!showFlyerGrid && !showFlyerRail && !showOffers
    ? true
    : flyerCatalogue && folders.length === 0);
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
          ? `${folderTotal} fletushka aktive.`
          : q
            ? `${offerTotal} produkte · ${folderTotal} fletushka`
            : `${offerTotal} produkte aktive${categoryName ? ` te ${categoryName}` : ""}.`}
      </p>
      {catalogue ? (
        <div className="mt-5 flex flex-col gap-3">
          <DiscoverForm
            basePath={basePath}
            q={q}
            category={category}
            katalog={katalog}
            city={city}
            sort={sort}
            categories={categories}
            catalog
          />
          <CatalogFilters
            basePath={basePath}
            q={q}
            category={category}
            katalog={katalog}
            city={city}
            sort={sort}
            cities={cities}
          />
        </div>
      ) : (
        <div className="mt-8 max-w-xl">
          <DiscoverForm
            basePath={basePath}
            q={q}
            category={category}
            katalog={katalog}
            city={city}
            sort={sort}
            categories={categories}
          />
        </div>
      )}

      {q && shops.length > 0 ? (
        <div className="mt-10">
          <SectionHeading kicker="Dyqane" title="Lokacionet" />
          <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
            {shops.map((shop) => {
              const place = shop.city ?? shop.village ?? locationLabel(shop.locations_count, shop.address);
              return (
                <li key={shop.id}>
                  <Link
                    href={`/biznese/${shop.id}`}
                    className="flex min-h-12 min-w-0 items-center gap-3 border-b border-line px-1 py-3 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <ShopLogo name={shop.name} logoUrl={shop.logo_url} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-extrabold">{shop.name}</span>
                      {place ? (
                        <span className="block truncate text-sm text-muted">{place}</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {catalogue && katalog && !empty ? (
        <CatalogStream
          key={`${q}|${category ?? ""}|${city ?? ""}|${sort}`}
          katalog={katalog}
          offers={offers}
          folders={folders}
          lastPage={lastPage}
          q={q || undefined}
          category={category}
          city={city}
          sort={sort}
        />
      ) : null}

      {showFlyerRail ? (
        <div className="mt-12">
          <SectionHeading kicker="Fushata" title="Fletushkat" />
          <CampaignRail folders={folders} eager={page === 1} />
        </div>
      ) : null}

      {!catalogue && showFlyerGrid && folders.length > 0 ? (
        <div className="mt-12 grid gap-4">
          <CampaignPoster folder={folders[0]} layout="feature" eager={page === 1} />
          <CampaignGrid folders={folders.slice(1)} />
        </div>
      ) : null}

      {!catalogue && showOffers ? (
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

      {catalogue ? null : (
        <Pager
          page={page}
          lastPage={lastPage}
          hrefFor={(next) => browsePath(basePath, { q, category, katalog, page: next })}
        />
      )}
    </Band>
  );
}
