import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { HomeView } from "@/features/public/HomeView";
import { EmptyNote, Frame } from "@/features/public/Frame";
import { ResultsView } from "@/features/public/ResultsView";
import {
  ApiError,
  fetchPublicBusinesses,
  fetchPublicCategories,
  fetchPublicFolders,
  fetchPublicHome,
  fetchPublicOffers,
  type PublicHome,
} from "@/features/offers/api";
import { legacyKatalogRedirect, readKatalog, readSort } from "@/lib/browse";
import { publicPageMetadata } from "@/lib/metadata";
import { SITE_DESCRIPTION } from "@/lib/site";
import type { CategorySummary, PublicBusiness, PublicFolder, PublicOffer } from "@/types";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    katalog?: string;
    city?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const katalog = readKatalog(params.katalog);

  // Legacy katalog URLs redirect in the page; keep metadata non-indexable if hit.
  if (katalog) {
    return publicPageMetadata({
      title: katalog === "fletushka" ? "Fletushkat" : "Ofertat",
      description: SITE_DESCRIPTION,
      path: "/",
      index: false,
    });
  }

  const filtered = Boolean(q || params.category || params.city || params.sort || params.page);

  if (filtered) {
    return publicPageMetadata({
      title: q ? `Kërko: ${q}` : "Zbritjet",
      description: SITE_DESCRIPTION,
      path: "/",
      index: false,
    });
  }

  return publicPageMetadata({
    title: "Zbritjet e ditës",
    description: SITE_DESCRIPTION,
    path: "/",
  });
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const legacyKatalog = readKatalog(params.katalog);
  if (legacyKatalog) {
    permanentRedirect(legacyKatalogRedirect(legacyKatalog, params));
  }

  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() || undefined;
  const city = params.city?.trim() || undefined;
  const sort = readSort(params.sort);
  const page = Math.max(1, Number(params.page) || 1);
  const browsing = q === "" && !category && page === 1;

  let folders: PublicFolder[] = [];
  let offers: PublicOffer[] = [];
  let shops: PublicBusiness[] = [];
  let folderLastPage = 1;
  let offerLastPage = 1;
  let folderTotal = 0;
  let offerTotal = 0;
  let categories: CategorySummary[] = [];
  let home: PublicHome | null = null;
  let errorMessage: string | null = null;

  try {
    const [folderResult, offerResult, categoryList, homeResult, shopResult] = await Promise.all([
      !browsing
        ? fetchPublicFolders({
            q: q || undefined,
            category,
            city,
            sort,
            page,
            perPage: 8,
          })
        : Promise.resolve(null),
      !browsing
        ? fetchPublicOffers({
            q: q || undefined,
            category,
            city,
            sort,
            page,
            perPage: 16,
          })
        : Promise.resolve(null),
      browsing ? Promise.resolve([]) : fetchPublicCategories().catch(() => []),
      browsing ? fetchPublicHome() : Promise.resolve(null),
      !browsing && q !== ""
        ? fetchPublicBusinesses({ q, perPage: 24 }).catch(() => null)
        : Promise.resolve(null),
    ]);
    folders = folderResult?.data ?? [];
    offers = offerResult?.data ?? [];
    shops = shopResult?.data ?? [];
    folderLastPage = folderResult?.meta?.last_page ?? 1;
    offerLastPage = offerResult?.meta?.last_page ?? 1;
    folderTotal = folderResult?.meta?.total ?? folders.length;
    offerTotal = offerResult?.meta?.total ?? offers.length;
    categories = categoryList;
    home = homeResult;
  } catch (error) {
    errorMessage =
      error instanceof ApiError
        ? "Nuk mundëm t’i ngarkojmë ofertat tani. Provo përsëri së shpejti."
        : "Nuk mundëm t’i ngarkojmë ofertat tani. Provo përsëri së shpejti.";
  }

  if (errorMessage) {
    return (
      <Frame className="py-16">
        <EmptyNote title="Diçka shkoi keq" body={errorMessage} />
      </Frame>
    );
  }

  if (!browsing) {
    return (
      <ResultsView
        folders={folders}
        offers={offers}
        categories={categories}
        q={q}
        category={category}
        city={city}
        sort={sort}
        page={page}
        offerLastPage={offerLastPage}
        folderLastPage={folderLastPage}
        offerTotal={offerTotal}
        folderTotal={folderTotal}
        shops={shops}
      />
    );
  }

  return (
    <HomeView
      home={
        home ?? {
          hero: null,
          heroes: [],
          featured: [],
          fresh: [],
          ending_soon: [],
          flyers: [],
          shops: [],
          categories: [],
          exclusive: [],
          sections: [],
        }
      }
    />
  );
}
