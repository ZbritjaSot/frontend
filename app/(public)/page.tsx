import type { Metadata } from "next";
import { ApiError, fetchPublicOffers } from "@/features/offers/api";
import { OfferList } from "@/features/offers/OfferList";
import { SITE_TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ofertat",
};

export default async function HomePage() {
  let offers = null;
  let errorMessage: string | null = null;

  try {
    const page = await fetchPublicOffers();
    offers = page.data;
  } catch (error) {
    errorMessage =
      error instanceof ApiError
        ? "Nuk mundëm t’i ngarkojmë ofertat tani. Provo përsëri së shpejti."
        : "Nuk mundëm t’i ngarkojmë ofertat tani. Provo përsëri së shpejti.";
  }

  return (
    <>
      <section className="public-hero">
        <p className="public-hero__eyebrow">Kosovë · EUR</p>
        <h1 className="public-hero__title">Ofertat e sotme</h1>
        <p className="public-hero__lead">{SITE_TAGLINE}</p>
      </section>

      {errorMessage ? (
        <section className="public-state" aria-live="polite">
          <h2 className="public-state__title">Diçka shkoi keq</h2>
          <p className="public-state__copy">{errorMessage}</p>
        </section>
      ) : offers && offers.length === 0 ? (
        <section className="public-state" aria-live="polite">
          <h2 className="public-state__title">Nuk ka oferta aktive</h2>
          <p className="public-state__copy">
            Momentalisht nuk ka zbritje publike. Kthehu më vonë.
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
