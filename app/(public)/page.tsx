import type { Metadata } from "next";
import { HomeView } from "@/features/public/HomeView";
import { EmptyNote, Frame } from "@/features/public/Frame";
import { ResultsView } from "@/features/public/ResultsView";
import {
  ApiError,
  fetchPublicCategories,
  fetchPublicFolders,
  fetchPublicOffers,
} from "@/features/offers/api";
import type { CategorySummary, PublicFolder, PublicOffer } from "@/types";

export const metadata: Metadata = {
  title: "Zbritjet e ditës",
};

type HomePageProps = {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() || undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const browsing = q === "" && !category && page === 1;

  let folders: PublicFolder[] = [];
  let offers: PublicOffer[] = [];
  let folderLastPage = 1;
  let offerLastPage = 1;
  let categories: CategorySummary[] = [];
  let errorMessage: string | null = null;

  try {
    const [folderResult, offerResult, categoryList] = await Promise.all([
      fetchPublicFolders({
        q: q || undefined,
        category,
        page,
        perPage: browsing ? 12 : 8,
      }),
      fetchPublicOffers({
        q: q || undefined,
        category,
        page,
        perPage: browsing ? 24 : 16,
      }),
      fetchPublicCategories().catch(() => []),
    ]);
    folders = folderResult.data;
    offers = offerResult.data;
    folderLastPage = folderResult.meta?.last_page ?? 1;
    offerLastPage = offerResult.meta?.last_page ?? 1;
    categories = categoryList;
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
        page={page}
        offerLastPage={offerLastPage}
        folderLastPage={folderLastPage}
      />
    );
  }

  return (
    <HomeView folders={folders} offers={offers} categories={categories} />
  );
}
