import type { Metadata } from "next";
import { BrowseBar } from "@/features/browse/BrowseBar";
import {
  ApiError,
  fetchPublicCategories,
  fetchPublicOffers,
} from "@/features/offers/api";
import { OfferList } from "@/features/offers/OfferList";
import type { CategorySummary, PublicOffer } from "@/types";

export const metadata: Metadata = {
  title: "Ofertat",
};

type HomePageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() || undefined;
  const filtering = q !== "" || Boolean(category);

  let offers: PublicOffer[] | null = null;
  let categories: CategorySummary[] = [];
  let errorMessage: string | null = null;

  try {
    const [page, categoryList] = await Promise.all([
      fetchPublicOffers({ q: q || undefined, category }),
      fetchPublicCategories().catch(() => []),
    ]);
    offers = page.data;
    categories = categoryList;
  } catch (error) {
    errorMessage =
      error instanceof ApiError
        ? "Nuk mundëm t’i ngarkojmë ofertat tani. Provo përsëri së shpejti."
        : "Nuk mundëm t’i ngarkojmë ofertat tani. Provo përsëri së shpejti.";
  }

  return (
    <>
      <h1 className="sr-only">Ofertat</h1>
      <BrowseBar q={q} category={category} categories={categories} />

      {errorMessage ? (
        <section
          className="rounded-2xl border border-line bg-elevated px-5 py-10"
          aria-live="polite"
        >
          <h2 className="m-0 text-lg font-semibold">Diçka shkoi keq</h2>
          <p className="mt-3 max-w-lg leading-relaxed text-muted">
            {errorMessage}
          </p>
        </section>
      ) : offers && offers.length === 0 ? (
        <section
          className="rounded-2xl border border-line bg-elevated px-5 py-10"
          aria-live="polite"
        >
          <h2 className="m-0 text-lg font-semibold">
            {filtering ? "Nuk u gjet asgjë" : "Nuk ka oferta aktive"}
          </h2>
          <p className="mt-3 max-w-lg leading-relaxed text-muted">
            {filtering
              ? "Provo një fjalë tjetër ose një kategori tjetër."
              : "Momentalisht nuk ka zbritje publike. Ofertat e skaduara hiqen automatikisht nga lista."}
          </p>
        </section>
      ) : offers ? (
        <section aria-label="Lista e ofertave">
          <OfferList offers={offers} />
        </section>
      ) : null}
    </>
  );
}
