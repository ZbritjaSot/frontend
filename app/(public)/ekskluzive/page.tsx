import type { Metadata } from "next";
import {
  fetchPublicCities,
  fetchPublicPlacement,
  fetchPublicSections,
} from "@/features/offers/api";
import { CatalogFilters } from "@/features/public/CatalogFilters";
import { EmptyNote, Frame } from "@/features/public/Frame";
import { ExclusiveSearch } from "@/features/public/ExclusiveSearch";
import { ExclusiveStream } from "@/features/public/ExclusiveStream";
import { ExclusiveMark } from "@/features/public/exclusiveChrome";
import { EXCLUSIVE_PAGE_SIZE } from "@/features/public/exclusiveConstants";
import { publicPageMetadata } from "@/lib/metadata";
import { EXCLUSIVE_HREF, EXCLUSIVE_LABEL } from "@/lib/exclusive";
import { SITE_NAME } from "@/lib/site";

type ExclusivePageProps = {
  searchParams: Promise<{ q?: string; city?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ExclusivePageProps): Promise<Metadata> {
  let title = EXCLUSIVE_LABEL;
  const { q, city } = await searchParams;
  try {
    const sections = await fetchPublicSections();
    title = sections.find((section) => section.key === "exclusive")?.title || title;
  } catch {
    title = EXCLUSIVE_LABEL;
  }

  const query = q?.trim();
  const place = city?.trim();
  return publicPageMetadata({
    title: query
      ? `${title} · «${query}»`
      : place
        ? `${title} · ${place}`
        : title,
    description: `${title} në ${SITE_NAME}.`,
    path: EXCLUSIVE_HREF,
  });
}

export default async function ExclusivePage({ searchParams }: ExclusivePageProps) {
  let title = EXCLUSIVE_LABEL;
  const { q: rawQ, city: rawCity } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const city = rawCity?.trim() ?? "";

  try {
    const sections = await fetchPublicSections();
    title = sections.find((section) => section.key === "exclusive")?.title || title;
  } catch {
    // A failed settings read still shows the page.
  }

  let items: Awaited<ReturnType<typeof fetchPublicPlacement>>["data"] = [];
  let lastPage = 1;
  let cities: string[] = [];
  let failed = false;

  try {
    const [page, cityList] = await Promise.all([
      fetchPublicPlacement({
        page: 1,
        perPage: EXCLUSIVE_PAGE_SIZE,
        q: q || undefined,
        city: city || undefined,
      }),
      fetchPublicCities().catch(() => [] as string[]),
    ]);
    items = page.data;
    lastPage = page.meta?.last_page ?? 1;
    cities = cityList;
  } catch {
    failed = true;
  }

  const streamKey = `${q}|${city}` || "all";

  return (
    <div className="pb-24 sm:pb-28">
      {/* Solid forest opening — typography + spacing, no gradient. */}
      <header className="bg-forest text-ivory">
        <Frame className="pt-14 pb-10 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-14">
          <div className="grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,32rem)] lg:items-end lg:gap-16">
            <div className="min-w-0">
              <ExclusiveMark size="lg" />
              <h1 className="m-0 mt-5 text-[clamp(2.35rem,5.2vw,4rem)] leading-[0.92] font-extrabold tracking-[-0.05em]">
                {title}
              </h1>
              <p className="mt-4 mb-0 max-w-md text-[0.95rem] leading-relaxed text-ivory/58 sm:text-base">
                Zbritjet më të forta nga dyqanet — të zgjedhura me kujdes për ty.
              </p>
            </div>
            <div className="w-full lg:justify-self-end">
              <ExclusiveSearch
                key={streamKey}
                initialQ={q}
                city={city || undefined}
                tone="forest"
              />
            </div>
          </div>
        </Frame>
      </header>

      <Frame className="pt-8 sm:pt-10 lg:pt-12">
        {cities.length > 0 ? (
          <div className="mb-8 sm:mb-10">
            <CatalogFilters
              basePath={EXCLUSIVE_HREF}
              q={q}
              city={city || undefined}
              cities={cities}
              showSort={false}
            />
          </div>
        ) : null}
        {failed ? (
          <EmptyNote
            title="Diçka shkoi keq"
            body="Nuk mundëm t’i ngarkojmë ofertat. Provo përsëri së shpejti."
          />
        ) : items.length === 0 ? (
          <div className="max-w-lg py-24 sm:py-32">
            <h2 className="m-0 text-[clamp(1.85rem,4vw,2.75rem)] leading-[0.95] font-extrabold tracking-[-0.04em]">
              {q || city ? "Asnjë rezultat" : "Momentalisht bosh"}
            </h2>
            <p className="mt-4 mb-0 max-w-sm text-base leading-relaxed text-muted">
              {q
                ? `Nuk u gjet asgjë për «${q}». Provo një fjalë tjetër.`
                : city
                  ? `Nuk ka oferta ekskluzive në ${city}.`
                  : "Kthehu më vonë për oferta të reja."}
            </p>
          </div>
        ) : (
          <ExclusiveStream
            key={streamKey}
            items={items}
            lastPage={lastPage}
            q={q}
            city={city}
          />
        )}
      </Frame>
    </div>
  );
}
