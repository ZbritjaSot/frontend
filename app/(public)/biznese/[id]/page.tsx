import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OfferPlace } from "@/components/place/OfferPlace";
import { BrowseBar } from "@/features/browse/BrowseBar";
import {
  fetchPublicBusiness,
  fetchPublicCategories,
  fetchPublicOffers,
  isNotFound,
} from "@/features/offers/api";
import { OfferList } from "@/features/offers/OfferList";
import { SITE_NAME } from "@/lib/site";
import type { CategorySummary, PublicBusiness, PublicOffer } from "@/types";

type BusinessPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
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

  let business: PublicBusiness | null = null;
  let offers: PublicOffer[] = [];
  let categories: CategorySummary[] = [];
  let failed = false;

  try {
    const [shop, page, categoryList] = await Promise.all([
      fetchPublicBusiness(id),
      fetchPublicOffers({
        q: q || undefined,
        category,
        business: id,
      }),
      fetchPublicCategories().catch(() => []),
    ]);
    business = shop;
    offers = page.data;
    categories = categoryList;
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    failed = true;
  }

  if (failed || !business) {
    return (
      <section
        className="rounded-2xl border border-line bg-elevated px-5 py-10"
        aria-live="polite"
      >
        <h1 className="m-0 text-lg font-semibold">Diçka shkoi keq</h1>
        <p className="mt-3 max-w-lg leading-relaxed text-muted">
          Nuk mundëm ta ngarkojmë këtë dyqan. Provo përsëri së shpejti.
        </p>
      </section>
    );
  }

  const lines = [business.street, business.village, business.city].filter(
    (part): part is string => Boolean(part),
  );

  const address =
    lines.length > 0 ? lines.join(", ") : (business.address ?? "");

  return (
    <>
      <div className="mb-8 flex flex-col items-start gap-5 lg:flex-row lg:gap-8">
        <div className="shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-accent"
          >
            <ArrowBackIcon fontSize="small" />
            Të gjitha ofertat
          </Link>
          <header className="mt-4">
            <h1 className="m-0 text-[clamp(1.85rem,3vw,2.5rem)] leading-[1.1] font-bold tracking-[-0.03em]">
              {business.name}
            </h1>
            {address ? (
              <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">
                {address}
              </p>
            ) : null}
          </header>
        </div>

        <OfferPlace
          showHeading={false}
          className="w-full lg:min-w-0 lg:flex-1"
          mapClassName="h-80"
          name={business.name}
          place={{
            address: business.address,
            latitude: business.latitude,
            longitude: business.longitude,
          }}
        />
      </div>

      <BrowseBar
        basePath={`/biznese/${business.id}`}
        q={q}
        category={category}
        categories={categories}
      />

      {offers.length === 0 ? (
        <section
          className="rounded-2xl border border-line bg-elevated px-5 py-10"
          aria-live="polite"
        >
          <h2 className="m-0 text-lg font-semibold">Nuk ka oferta aktive</h2>
          <p className="mt-3 max-w-lg leading-relaxed text-muted">
            Ky dyqan nuk ka zbritje që përputhen me kërkimin.
          </p>
        </section>
      ) : (
        <section aria-label="Ofertat e dyqanit">
          <OfferList offers={offers} />
        </section>
      )}
    </>
  );
}
