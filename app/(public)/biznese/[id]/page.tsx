import type { Metadata } from "next";
import Link from "next/link";
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
  searchParams: Promise<{ q?: string; category?: string; page?: string; fp?: string }>;
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

  const lines = [business.street, business.village, business.city].filter(
    (part): part is string => Boolean(part),
  );
  const address = lines.length > 0 ? lines.join(", ") : (business.address ?? "");
  const place = business.city ?? business.village ?? "Dyqan lokal";
  const otherLocations = (business.locations ?? []).filter(
    (location) => location.id !== business.id,
  );

  return (
    <article>
      <Frame className="pt-8">
        <header className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,420px)]">
          <div className={`${panel} p-6 sm:p-8`}>
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
            mapClassName="h-72 overflow-hidden rounded-2xl border border-line"
            name={business.name}
            place={{
              address: business.address,
              latitude: business.latitude,
              longitude: business.longitude,
            }}
          />
        </header>
      </Frame>

      {otherLocations.length > 0 ? (
        <Band className="pb-0">
          <h2 className="m-0 text-[clamp(1.7rem,3vw,2.3rem)] leading-none font-extrabold tracking-[-0.04em]">
            Lokacionet
          </h2>
          <ul className="m-0 mt-6 grid list-none gap-2 p-0 sm:grid-cols-2">
            {otherLocations.map((location) => {
              const where = [location.city, location.village].find(
                (part): part is string => Boolean(part),
              );
              return (
                <li key={location.id}>
                  <Link
                    href={`/biznese/${location.id}`}
                    className="flex min-h-20 flex-col justify-center rounded-xl border border-line bg-elevated px-4 py-3 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="font-extrabold tracking-tight">
                      {location.name}
                    </span>
                    <span className="text-sm text-muted">
                      {location.parent_id ? "Degë" : "Dyqani kryesor"}
                      {where ? ` · ${where}` : ""}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Band>
      ) : null}

      {!filtering ? (
        <>
          <Band className="pb-4">
            <DiscoverForm
              basePath={basePath}
              categories={categories}
            />
          </Band>
          {folders.length > 0 ? (
            <Band>
              <h2 className="m-0 mb-6 text-[clamp(2rem,4vw,3rem)] leading-[0.9] font-extrabold tracking-[-0.05em]">
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
              <h2 className="m-0 mb-8 text-[clamp(1.7rem,3vw,2.3rem)] leading-none font-extrabold tracking-[-0.04em]">
                {page > 1 ? "Më shumë produkte" : "Zbritjet aktive"}
              </h2>
              <ProductGrid offers={offers} dense={offers.length > 9} />
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
