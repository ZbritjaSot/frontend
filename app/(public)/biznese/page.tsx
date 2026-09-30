import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters } from "@/features/public/CatalogFilters";
import { DiscoverForm } from "@/features/public/DiscoverForm";
import { Band, EmptyNote, Frame, Pager } from "@/features/public/Frame";
import { display, kicker } from "@/features/public/tone";
import { ShopLogo } from "@/features/public/visuals";
import { campaignWord, locationLabel, productWord } from "@/features/public/compose";
import { ApiError, fetchPublicBusinesses, fetchPublicCities } from "@/features/offers/api";
import { browsePath } from "@/lib/browse";
import { publicPageMetadata } from "@/lib/metadata";
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
      title: city ? `Dyqanet në ${city}` : q ? `Dyqanet: ${q}` : "Dyqanet",
      description: "Dyqanet lokale me fletushka aktive në Kosovë.",
      path: "/biznese",
      index: false,
    });
  }

  return publicPageMetadata({
    title: "Dyqanet",
    description: "Dyqanet lokale me fletushka aktive në Kosovë.",
    path: "/biznese",
  });
}

export default async function BusinessDirectoryPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const city = params.city?.trim() || undefined;
  const page = Math.max(1, Number(params.page) || 1);

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
        page,
        perPage: 24,
      }),
      fetchPublicCities({ shops: true }).catch(() => [] as string[]),
    ]);
    shops = result.data;
    cities = cityList;
    lastPage = result.meta?.last_page ?? 1;
    total = result.meta?.total ?? shops.length;
  } catch (error) {
    errorMessage =
      error instanceof ApiError
        ? "Nuk mundëm t’i ngarkojmë dyqanet tani. Provo përsëri së shpejti."
        : "Nuk mundëm t’i ngarkojmë dyqanet tani. Provo përsëri së shpejti.";
  }

  if (errorMessage) {
    return (
      <Frame className="py-16">
        <EmptyNote title="Diçka shkoi keq" body={errorMessage} />
      </Frame>
    );
  }

  return (
    <Band className="pt-8">
      <p className={kicker}>Dyqane</p>
      <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)] ${display}`}>Dyqanet</h1>
      <p className="mt-3 mb-0 max-w-xl text-sm leading-relaxed text-muted">
        {total} dyqane me fletushka aktive. Kjo nuk është çdo biznes në Kosovë, vetëm ata
        që kanë një fletushkë publike tani.
      </p>
      <div className="mt-6 flex max-w-xl flex-col gap-3">
        <DiscoverForm
          basePath="/biznese"
          q={q}
          city={city}
          categories={[]}
          showCategories={false}
          placeholder=""
        />
        <CatalogFilters
          basePath="/biznese"
          q={q}
          city={city}
          cities={cities}
          showSort={false}
        />
      </div>
      {shops.length === 0 ? (
        <EmptyNote
          title="Nuk u gjet asgjë"
          body={
            city
              ? `Nuk ka dyqan në ${city}.`
              : "Provo një emër tjetër, ose kthehu te të gjithë dyqanet."
          }
        />
      ) : (
        <ul className="m-0 mt-8 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => {
            const place = locationLabel(shop.locations_count, shop.city ?? shop.village);
            const flyers = shop.flyers_count ?? 0;
            const offers = shop.offers_count ?? 0;
            return (
              <li key={shop.id}>
                <Link
                  href={`/biznese/${shop.id}`}
                  className="flex min-h-36 items-center gap-3 rounded-xl border border-line bg-elevated px-3 py-3 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:transition-colors dark:border-white/10 dark:bg-[#1a2420]"
                >
                  <ShopLogo name={shop.name} logoUrl={shop.logo_url} size="md" />
                  <span className="min-w-0">
                    <span className="block truncate font-extrabold">{shop.name}</span>
                    <span className="block truncate text-sm text-muted">
                      {place ? `${place} · ` : ""}
                      {flyers} {campaignWord(flyers)} · {offers} {productWord(offers)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <Pager
        page={page}
        lastPage={lastPage}
        hrefFor={(next) => browsePath("/biznese", { q, city, page: next })}
      />
    </Band>
  );
}
