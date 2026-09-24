import { CampaignRail } from "@/features/public/CampaignPoster";
import { DiscoverForm } from "@/features/public/DiscoverForm";
import { Band, EmptyNote, Pager } from "@/features/public/Frame";
import { ProductGrid } from "@/features/public/ProductPoster";
import { browsePath } from "@/lib/browse";
import type { CategorySummary, PublicFolder, PublicOffer } from "@/types";

type ResultsViewProps = {
  folders: PublicFolder[];
  offers: PublicOffer[];
  categories: CategorySummary[];
  q: string;
  category?: string;
  page: number;
  offerLastPage: number;
  folderLastPage: number;
  basePath?: string;
};

export function ResultsView({
  folders,
  offers,
  categories,
  q,
  category,
  page,
  offerLastPage,
  folderLastPage,
  basePath = "/",
}: ResultsViewProps) {
  const categoryName = categories.find((item) => item.slug === category)?.name;
  const title = q
    ? `«${q}»`
    : (categoryName ?? (page > 1 ? "Më shumë oferta" : "Ofertat"));
  const kicker = q && categoryName ? categoryName : "Kërkimi";
  const showCampaigns = page === 1 && folders.length > 0;
  const lastPage = offers.length > 0 || offerLastPage > 1 ? offerLastPage : folderLastPage;
  const empty = offers.length === 0 && !showCampaigns;

  return (
    <Band className="pt-8">
      <p className="m-0 text-[0.7rem] font-bold tracking-[0.18em] text-muted uppercase">
        {kicker}
      </p>
      <h1 className="m-0 mt-3 max-w-3xl text-[clamp(2.2rem,6vw,3.6rem)] leading-[0.95] font-extrabold tracking-[-0.045em]">
        {title}
      </h1>
      <div className="mt-8 max-w-xl">
        <DiscoverForm
          basePath={basePath}
          q={q}
          category={category}
          categories={categories}
        />
      </div>

      {showCampaigns ? (
        <div className="mt-12">
          <h2 className="m-0 mb-5 text-sm font-bold tracking-[0.16em] text-muted uppercase">
            Fletushkat
          </h2>
          <CampaignRail folders={folders} />
        </div>
      ) : null}

      {offers.length > 0 ? (
        <div className="mt-12">
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
        hrefFor={(next) => browsePath(basePath, { q, category, page: next })}
      />
    </Band>
  );
}
