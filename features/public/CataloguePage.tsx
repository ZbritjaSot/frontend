import { EmptyNote, Frame } from "@/features/public/Frame";
import { ResultsView } from "@/features/public/ResultsView";
import {
  ApiError,
  fetchPublicCategories,
  fetchPublicCities,
  fetchPublicFolders,
  fetchPublicOffers,
} from "@/features/offers/api";
import { catalogPath, readSort, type Katalog } from "@/lib/browse";
import { publicPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { CategorySummary, PublicFolder, PublicOffer } from "@/types";

export type CatalogueSearchParams = {
  q?: string;
  category?: string;
  page?: string;
  city?: string;
  sort?: string;
};

export function catalogueMetadata(
  katalog: Katalog,
  params: CatalogueSearchParams,
): Metadata {
  const q = params.q?.trim() ?? "";
  const filtered = Boolean(q || params.category || params.city || params.sort || params.page);
  const path = catalogPath(katalog);

  if (katalog === "oferta" && !filtered) {
    return publicPageMetadata({
      title: "Ofertat",
      description: "Zbritjet aktive nga dyqanet lokale në Kosovë.",
      path,
    });
  }

  if (katalog === "fletushka" && !filtered) {
    return publicPageMetadata({
      title: "Fletushkat",
      description: "Fletushkat e dyqaneve lokale në Kosovë.",
      path,
    });
  }

  return publicPageMetadata({
    title: q ? `Kërko: ${q}` : katalog === "fletushka" ? "Fletushkat" : "Ofertat",
    description:
      katalog === "fletushka"
        ? "Fletushkat e dyqaneve lokale në Kosovë."
        : "Zbritjet aktive nga dyqanet lokale në Kosovë.",
    path,
    index: false,
  });
}

export async function CataloguePage({
  katalog,
  searchParams,
}: {
  katalog: Katalog;
  searchParams: Promise<CatalogueSearchParams>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() || undefined;
  const city = params.city?.trim() || undefined;
  const sort = readSort(params.sort);
  const page = 1;
  const basePath = catalogPath(katalog);

  let folders: PublicFolder[] = [];
  let offers: PublicOffer[] = [];
  let categories: CategorySummary[] = [];
  let cities: string[] = [];
  let offerLastPage = 1;
  let folderLastPage = 1;
  let offerTotal = 0;
  let folderTotal = 0;
  let errorMessage: string | null = null;

  try {
    const [folderResult, offerResult, categoryList, cityList] = await Promise.all([
      katalog === "fletushka"
        ? fetchPublicFolders({
            q: q || undefined,
            category,
            city,
            sort,
            page,
            perPage: 12,
          })
        : Promise.resolve(null),
      katalog === "oferta"
        ? fetchPublicOffers({
            q: q || undefined,
            category,
            city,
            sort,
            page,
            perPage: 16,
          })
        : Promise.resolve(null),
      fetchPublicCategories().catch(() => []),
      fetchPublicCities().catch(() => []),
    ]);
    folders = folderResult?.data ?? [];
    offers = offerResult?.data ?? [];
    categories = categoryList;
    cities = cityList;
    offerLastPage = offerResult?.meta?.last_page ?? 1;
    folderLastPage = folderResult?.meta?.last_page ?? 1;
    offerTotal = offerResult?.meta?.total ?? offers.length;
    folderTotal = folderResult?.meta?.total ?? folders.length;
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

  return (
    <ResultsView
      folders={folders}
      offers={offers}
      categories={categories}
      q={q}
      category={category}
      katalog={katalog}
      city={city}
      sort={sort}
      cities={cities}
      page={page}
      offerLastPage={offerLastPage}
      folderLastPage={folderLastPage}
      offerTotal={offerTotal}
      folderTotal={folderTotal}
      basePath={basePath}
    />
  );
}
