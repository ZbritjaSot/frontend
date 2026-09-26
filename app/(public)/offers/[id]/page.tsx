import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  fetchPublicFolder,
  fetchPublicOffer,
  fetchPublicPlacement,
  fetchPublicSections,
  isNotFound,
  recordPublicOfferView,
} from "@/features/offers/api";
import { withCampaign } from "@/features/public/compose";
import { EmptyNote, Frame } from "@/features/public/Frame";
import { OfferDetail } from "@/features/offers/OfferDetail";
import type { ExclusiveItem } from "@/features/offers/api";
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
  let exclusive: ExclusiveItem[] = [];
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
    let showExclusive = true;
    try {
      const sections = await fetchPublicSections();
      showExclusive = sections.some((section) => section.key === "exclusive");
    } catch {
      showExclusive = true;
    }
    if (showExclusive) {
      try {
        exclusive = (await fetchPublicPlacement({ perPage: 40 })).data.filter(
          (item) => item.kind === "flyer" || item.offer.id !== offer?.id,
        );
      } catch {
        exclusive = [];
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

  const requestHeaders = await headers();
  const prefetched =
    requestHeaders.get("next-router-prefetch") === "1" ||
    requestHeaders.get("purpose") === "prefetch";
  if (!prefetched) {
    try {
      await recordPublicOfferView(offer.id);
    } catch {
      // The product is already loaded. A missed count does not replace the page.
    }
  }

  return <OfferDetail offer={offer} related={related} exclusive={exclusive} />;
}
