import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferPlace } from "@/components/place/OfferPlace";
import { CampaignRail } from "@/features/public/CampaignPoster";
import { campaignWord, productWord } from "@/features/public/compose";
import { DiscoverForm } from "@/features/public/DiscoverForm";
import { BackLink, Band, EmptyNote, Frame, Pager } from "@/features/public/Frame";
import { ProductGrid } from "@/features/public/ProductPoster";
import { ResultsView } from "@/features/public/ResultsView";
import { ShopLogo } from "@/features/public/visuals";
import {
  fetchPublicBusiness,
  fetchPublicCategories,
  fetchPublicFolders,
  fetchPublicOffers,
  isNotFound,
} from "@/features/offers/api";
import { browsePath } from "@/lib/browse";
import { SITE_NAME } from "@/lib/site";
import type { CategorySummary, PublicBusiness, PublicFolder, PublicOffer } from "@/types";

type BusinessPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
};

export async function generateMetadata({
  params,
}: BusinessPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const business = await fetchPublicBusiness(id);
    return {
      title: business.name,
      description: `${business.name} — ${SITE_NAME}`,
    };
  } catch {
    return { title: "Dyqani" };
  }
}

export default async function BusinessPage({
  params,
  searchParams,
}: BusinessPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const q = query.q?.trim() ?? "";
  const category = query.category?.trim() || undefined;
  const page = Math.max(1, Number(query.page) || 1);
  const filtering = q !== "" || Boolean(category);
  const basePath = `/biznese/${id}`;

  let business: PublicBusiness | null = null;
  let folders: PublicFolder[] = [];
  let offers: PublicOffer[] = [];
  let folderLastPage = 1;
  let offerLastPage = 1;
  let folderTotal = 0;
  let offerTotal = 0;
  let categories: CategorySummary[] = [];
  let failed = false;

  try {
    const [shop, folderResult, offerResult, categoryList] = await Promise.all([
      fetchPublicBusiness(id),
      fetchPublicFolders({
        q: q || undefined,
        category,
        business: id,
        page,
        perPage: 24,
      }),
      fetchPublicOffers({
        q: q || undefined,
        category,
        business: id,
        page,
        perPage: 16,
      }),
      fetchPublicCategories().catch(() => []),
    ]);
    business = shop;
    folders = folderResult.data;
    offers = offerResult.data;
    folderLastPage = folderResult.meta?.last_page ?? 1;
    offerLastPage = offerResult.meta?.last_page ?? 1;
    folderTotal = folderResult.meta?.total ?? folders.length;
    offerTotal = offerResult.meta?.total ?? offers.length;
    categories = categoryList;
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    failed = true;
  }

  if (failed || !business) {
    return (
      <Frame className="py-16">
        <EmptyNote
          title="Diçka shkoi keq"
          body="Nuk mundëm ta ngarkojmë këtë dyqan. Provo përsëri së shpejti."
        />
      </Frame>
    );
  }

  const lines = [business.street, business.village, business.city].filter(
    (part): part is string => Boolean(part),
  );
  const address = lines.length > 0 ? lines.join(", ") : (business.address ?? "");
  const place = business.city ?? business.village ?? "Dyqan lokal";
  const lastPage = offers.length > 0 || offerLastPage > 1 ? offerLastPage : folderLastPage;

  return (
    <article>
      <Frame className="pt-8">
        <BackLink href="/">Kreu</BackLink>
        <header className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,420px)]">
          <div>
            <ShopLogo
              name={business.name}
              logoUrl={business.logo_url}
              size="xl"
            />
            <p className="m-0 mt-6 text-[0.7rem] font-bold tracking-[0.18em] text-muted uppercase">
              {place}
            </p>
            <h1 className="m-0 mt-3 text-[clamp(2.6rem,6vw,4.4rem)] leading-[0.92] font-extrabold tracking-[-0.05em]">
              {business.name}
            </h1>
            {address ? (
              <p className="mt-4 mb-0 max-w-md text-base leading-relaxed text-muted">
                {address}
              </p>
            ) : null}
            <p className="mt-4 mb-0 text-sm font-semibold">
              {folderTotal} {campaignWord(folderTotal)} · {offerTotal}{" "}
              {productWord(offerTotal)}
            </p>
          </div>
          <OfferPlace
            surface="plain"
            showHeading={false}
            className="w-full"
            mapClassName="h-72 rounded-[1.5rem]"
            name={business.name}
            place={{
              address: business.address,
              latitude: business.latitude,
              longitude: business.longitude,
            }}
          />
        </header>
      </Frame>

      {!filtering ? (
        <>
          <Band className="pb-4">
            <DiscoverForm
              basePath={basePath}
              categories={categories}
            />
          </Band>
          {page === 1 && folders.length > 0 ? (
            <Band>
              <h2 className="m-0 mb-6 text-[clamp(1.7rem,3vw,2.3rem)] leading-none font-extrabold tracking-[-0.04em]">
                Fletushkat
              </h2>
              <CampaignRail folders={folders} />
            </Band>
          ) : null}
          {offers.length > 0 ? (
            <Band>
              <h2 className="m-0 mb-8 text-[clamp(1.7rem,3vw,2.3rem)] leading-none font-extrabold tracking-[-0.04em]">
                {page > 1 ? "Më shumë produkte" : "Zbritjet aktive"}
              </h2>
              <ProductGrid offers={offers} />
              <Pager
                page={page}
                lastPage={lastPage}
                hrefFor={(next) => browsePath(basePath, { page: next })}
              />
            </Band>
          ) : folders.length === 0 ? (
            <Band>
              <EmptyNote
                title="Nuk ka oferta aktive"
                body="Ky dyqan nuk ka zbritje publike për momentin."
              />
            </Band>
          ) : null}
        </>
      ) : (
        <ResultsView
          basePath={basePath}
          folders={folders}
          offers={offers}
          categories={categories}
          q={q}
          category={category}
          page={page}
          offerLastPage={offerLastPage}
          folderLastPage={folderLastPage}
        />
      )}
    </article>
  );
}
