import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters } from "@/features/public/CatalogFilters";
import { DiscoverForm } from "@/features/public/DiscoverForm";
import { FilterChips } from "@/features/public/FilterChips";
import { BackToTop } from "@/features/public/BackToTop";
import { Band, EmptyNote, Frame } from "@/features/public/Frame";
import { PartnerBoard } from "@/features/public/PartnerBoard";
import {
  ApiError,
  fetchPublicBusinesses,
  fetchPublicCities,
  PUBLIC_BUSINESSES_PAGE_SIZE,
} from "@/features/offers/api";
import { browsePath, showCatalogControls } from "@/lib/browse";
import { publicPageMetadata } from "@/lib/metadata";
import { button } from "@/lib/ui";
import type { PublicBusiness } from "@/types";

type DirectoryPageProps = {
  searchParams: Promise<{ q?: string; city?: string; page?: string }>;
};

export async function generateMetadata({
  searchParams,
}: DirectoryPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const city = params.city?.trim() ?? "";
  if (q || city || params.page) {
    return publicPageMetadata({
      title: city ? `Partnerët në ${city}` : q ? `Partnerët: ${q}` : "Partnerët",
      description: "Partnerët lokalë me fletushka aktive në Kosovë.",
      path: "/biznese",
      index: false,
    });
  }

  return publicPageMetadata({
    title: "Partnerët",
    description: "Partnerët lokalë me fletushka aktive në Kosovë.",
    path: "/biznese",
  });
}

export default async function BusinessDirectoryPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const city = params.city?.trim() || undefined;

  let shops: PublicBusiness[] = [];
  let cities: string[] = [];
  let lastPage = 1;
  let total = 0;
  let errorMessage: string | null = null;

  try {
    const [result, cityList] = await Promise.all([
      fetchPublicBusinesses({
        q: q || undefined,
        city,
        // Matches `PartnerBoard`'s infinite-scroll page size.
        perPage: PUBLIC_BUSINESSES_PAGE_SIZE,
        rail: true,
      }),
      fetchPublicCities().catch(() => [] as string[]),
    ]);
    shops = result.data;
    cities = cityList;
    lastPage = result.meta?.last_page ?? 1;
    total = result.meta?.total ?? shops.length;
  } catch (error) {
    errorMessage =
      error instanceof ApiError
        ? "Nuk mundëm t’i ngarkojmë partnerët tani. Provo përsëri së shpejti."
        : "Nuk mundëm t’i ngarkojmë partnerët tani. Provo përsëri së shpejti.";
  }

  if (errorMessage) {
    return (
      <Frame className="py-16">
        <EmptyNote title="Diçka shkoi keq" body={errorMessage} />
      </Frame>
    );
  }

  return (
    <Band pad="page">
      <h1 className="m-0 text-title-1">Partnerët</h1>
      <p className="mt-3 mb-0 max-w-xl text-sm leading-relaxed text-muted">
        {total} partnerë me fletushka aktive.
      </p>
      <div className="mt-6 flex max-w-xl flex-col gap-3">
        <DiscoverForm
          basePath="/biznese"
          q={q}
          city={city}
          categories={[]}
          showCategories={false}
          placeholder="Kërko dyqane"
        />
        <FilterChips basePath="/biznese" q={q} city={city} />
        {showCatalogControls({
          hasResults: shops.length > 0,
          q,
          city,
        }) ? (
          <CatalogFilters
            basePath="/biznese"
            q={q}
            city={city}
            cities={cities}
            showSort={false}
          />
        ) : null}
      </div>
      {shops.length === 0 ? (
        <EmptyNote
          title="Nuk u gjet asgjë"
          body={
            city
              ? `Nuk ka partner në ${city}.`
              : "Provo një emër tjetër, ose kthehu te të gjithë partnerët."
          }
          action={
            q || city ? (
              <Link href={browsePath("/biznese", {})} className={button({ shape: "pill" })}>
                Shiko të gjithë partnerët
              </Link>
            ) : null
          }
        />
      ) : (
        <PartnerBoard
          key={`${q}|${city ?? ""}`}
          shops={shops}
          lastPage={lastPage}
          q={q}
          city={city}
        />
      )}
      <BackToTop />
    </Band>
  );
}
