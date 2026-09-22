import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchPublicOffer,
  isNotFound,
} from "@/features/offers/api";
import { OfferDetail } from "@/features/offers/OfferDetail";
import type { PublicOffer } from "@/types";
import { SITE_NAME } from "@/lib/site";

type OfferPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OfferPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const offer = await fetchPublicOffer(id);
    return {
      title: offer.name,
      description: `${offer.name} — ${SITE_NAME}`,
    };
  } catch {
    return { title: "Oferta" };
  }
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { id } = await params;

  let offer: PublicOffer | null = null;
  let failed = false;

  try {
    offer = await fetchPublicOffer(id);
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    failed = true;
  }

  if (failed) {
    return (
      <section className="public-state" aria-live="polite">
        <h1 className="public-state__title">Diçka shkoi keq</h1>
        <p className="public-state__copy">
          Nuk mundëm ta ngarkojmë këtë ofertë. Provo përsëri së shpejti.
        </p>
      </section>
    );
  }

  if (!offer) {
    notFound();
  }

  return <OfferDetail offer={offer} />;
}
