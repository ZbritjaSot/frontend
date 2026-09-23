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
      <section
        className="rounded-2xl border border-line bg-elevated px-5 py-10"
        aria-live="polite"
      >
        <h1 className="m-0 text-lg font-semibold">Diçka shkoi keq</h1>
        <p className="mt-3 max-w-lg leading-relaxed text-muted">
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
