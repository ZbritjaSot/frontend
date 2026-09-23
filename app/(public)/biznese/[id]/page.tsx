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
      <section className="public-state" aria-live="polite">
        <h1 className="public-state__title">Diçka shkoi keq</h1>
        <p className="public-state__copy">
          Nuk mundëm ta ngarkojmë këtë dyqan. Provo përsëri së shpejti.
        </p>
      </section>
    );
  }

  const lines = [business.street, business.village, business.city].filter(
    (part): part is string => Boolean(part),
  );

  return (
    <>
      <p className="public-hero__eyebrow">
        <Link href="/">Ofertat</Link>
      </p>
      <section className="public-hero">
        <h1 className="public-hero__title">{business.name}</h1>
        {lines.length > 0 ? (
          <p className="public-hero__lead">{lines.join(", ")}</p>
        ) : business.address ? (
          <p className="public-hero__lead">{business.address}</p>
        ) : null}
      </section>

      <OfferPlace
        name={business.name}
        place={{
          address: business.address,
          latitude: business.latitude,
          longitude: business.longitude,
        }}
      />

      <BrowseBar
        basePath={`/biznese/${business.id}`}
        q={q}
        category={category}
        categories={categories}
      />

      {offers.length === 0 ? (
        <section className="public-state" aria-live="polite">
          <h2 className="public-state__title">Nuk ka oferta aktive</h2>
          <p className="public-state__copy">
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
