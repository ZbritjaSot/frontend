import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchPublicFolder,
  fetchPublicOffer,
  isNotFound,
} from "@/features/offers/api";
import { withCampaign } from "@/features/public/compose";
import { EmptyNote, Frame } from "@/features/public/Frame";
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
  let related: PublicOffer[] = [];
  let failed = false;

  try {
    offer = await fetchPublicOffer(id);
    if (offer.bundle?.id) {
      try {
        const folder = await fetchPublicFolder(offer.bundle.id);
        related = withCampaign(folder)
          .filter((item) => item.id !== offer?.id)
          .slice(0, 4);
      } catch {
        related = [];
      }
    }
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    failed = true;
  }

  if (failed) {
    return (
      <Frame className="py-16">
        <EmptyNote
          title="Diçka shkoi keq"
          body="Nuk mundëm ta ngarkojmë këtë ofertë. Provo përsëri së shpejti."
        />
      </Frame>
    );
  }

  if (!offer) {
    notFound();
  }

  return <OfferDetail offer={offer} related={related} />;
}
