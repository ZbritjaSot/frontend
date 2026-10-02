import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferPlace } from "@/components/place/OfferPlace";
import { CampaignGrid, CampaignPoster } from "@/features/public/CampaignPoster";
import { campaignWord, productWord } from "@/features/public/compose";
import { DiscoverForm } from "@/features/public/DiscoverForm";
import { Band, EmptyNote, Frame, Pager } from "@/features/public/Frame";
import { ProductGrid } from "@/features/public/ProductPoster";
import { ResultsView } from "@/features/public/ResultsView";
import { display, kicker, panel } from "@/features/public/tone";
import { ShopLogo } from "@/features/public/visuals";
import { BranchPlaces, PlaceBranchRow } from "@/features/public/BranchPlaces";
import { ShopLinksRow } from "@/features/public/ShopLinksRow";
import {
  fetchPublicBusiness,
  fetchPublicCategories,
  fetchPublicFolders,
  fetchPublicOffers,
  isNotFound,
} from "@/features/offers/api";
import { browsePath } from "@/lib/browse";
import { publicPageMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";
import type { CategorySummary, PublicBusiness, PublicFolder, PublicOffer } from "@/types";

type BusinessPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; category?: string; page?: string; fp?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: BusinessPageProps): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;
  const filtered = Boolean(query.q || query.category || query.page || query.fp);

  try {
    const business = await fetchPublicBusiness(id);
    const place = [business.city, business.village].filter(Boolean).join(", ");
    return publicPageMetadata({
      title: business.name,
      description: place
        ? `${business.name} në ${place}. ${SITE_NAME}`
        : `${business.name}. ${SITE_NAME}`,
      path: `/biznese/${business.id}`,
      image: business.logo_url,
      index: !filtered,
    });
  } catch {
    return { title: "Dyqani", robots: { index: false, follow: false } };
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
  const flyerPage = Math.max(1, Number(query.fp) || 1);
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
        page: filtering ? page : flyerPage,
        perPage: 12,
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

  const place = business.city ?? business.village ?? "Dyqan lokal";
  const otherLocations = (business.locations ?? []).filter(
    (location) => location.id !== business.id,
  );
  const here = {
    id: business.id,
    name: business.name,
    address: business.address,
    latitude: business.latitude,
    longitude: business.longitude,
    logo_url: business.logo_url,
    parent_id: business.parent_id,
  };
  const hasHere =
    Boolean(here.address?.trim()) ||
    (here.latitude != null && here.longitude != null);

  return (
    <article>
      <Frame className="pt-8">
        <header className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,420px)]">
          <div className={`${panel} p-5 sm:p-6`}>
            <ShopLogo
              name={business.name}
              logoUrl={business.logo_url}
              size="xl"
            />
            <div className="mt-6">
              <p className={kicker}>{place}</p>
            </div>
            <h1 className={`m-0 mt-3 text-[clamp(2.8rem,6vw,4.8rem)] ${display}`}>
              {business.name}
            </h1>
            <ShopLinksRow business={business} className="mt-4" />
            <p className="mt-4 mb-0 text-sm font-semibold">
              {folderTotal} {campaignWord(folderTotal)} · {offerTotal}{" "}
              {productWord(offerTotal)}
            </p>
          </div>
          <div className="grid w-full gap-3">
            {hasHere ? (
              <PlaceBranchRow place={here} linked={false} />
            ) : null}
            <OfferPlace
              surface="plain"
              showHeading={false}
              showPin={false}
              className="w-full"
              mapClassName="h-72 overflow-hidden rounded-2xl border border-line"
              name={business.name}
              place={{
                address: business.address,
                latitude: business.latitude,
                longitude: business.longitude,
              }}
            />
          </div>
        </header>
        {otherLocations.length > 0 ? (
          <BranchPlaces
            places={otherLocations}
            title="Lokacionet"
            className="mt-8"
          />
        ) : null}
      </Frame>

      {!filtering ? (
        <>
          <Band pad="compact">
            <DiscoverForm
              basePath={basePath}
              categories={categories}
            />
          </Band>
          {folders.length > 0 ? (
            <Band>
              <h2 className="m-0 mb-8 text-[clamp(1.65rem,3vw,2.35rem)] leading-[0.95] font-extrabold tracking-[-0.04em]">
                Fletushkat
              </h2>
              <div className="grid gap-4">
                {flyerPage === 1 ? (
                  <CampaignPoster folder={folders[0]} layout="feature" eager />
                ) : null}
                <CampaignGrid folders={flyerPage === 1 ? folders.slice(1) : folders} />
              </div>
              <Pager
                page={flyerPage}
                lastPage={folderLastPage}
                hrefFor={(next) => browsePath(basePath, { page, fp: next })}
              />
            </Band>
          ) : null}
          {offers.length > 0 ? (
            <Band>
              <h2 className="m-0 mb-8 text-[clamp(1.65rem,3vw,2.35rem)] leading-[0.95] font-extrabold tracking-[-0.04em]">
                {page > 1 ? "Më shumë produkte" : "Zbritjet aktive"}
              </h2>
              <ProductGrid offers={offers} />
              <Pager
                page={page}
                lastPage={offerLastPage}
                hrefFor={(next) => browsePath(basePath, { page: next, fp: flyerPage })}
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
          offerTotal={offerTotal}
          folderTotal={folderTotal}
        />
      )}
    </article>
  );
}
