import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  fetchPublicFolder,
  fetchPublicOffer,
  fetchPublicRecommended,
  isNotFound,
  recordPublicOfferView,
} from "@/features/offers/api";
import { withCampaign } from "@/features/public/compose";
import { EmptyNote, Frame } from "@/features/public/Frame";
import { OfferDetail } from "@/features/offers/OfferDetail";
import type { PublicOffer } from "@/types";
import { publicPageMetadata } from "@/lib/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type OfferPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OfferPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const offer = await fetchPublicOffer(id);
    const shop = offer.business?.name;
    const description = shop
      ? `${offer.name} nga ${shop}. ${SITE_NAME}`
      : `${offer.name}. ${SITE_NAME}`;
    return publicPageMetadata({
      title: offer.name,
      description,
      path: `/offers/${offer.id}`,
      image: offer.image?.detail_url ?? offer.image?.thumb_url,
    });
  } catch {
    return { title: "Oferta", robots: { index: false, follow: false } };
  }
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { id } = await params;

  let offer: PublicOffer | null = null;
  let related: PublicOffer[] = [];
  let recommended: PublicOffer[] = [];
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
    try {
      recommended = await fetchPublicRecommended(offer.id);
    } catch {
      recommended = [];
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(offer)).replace(/</g, "\\u003c") }}
      />
      <OfferDetail offer={offer} related={related} recommended={recommended} />
    </>
  );
}

function productJsonLd(offer: PublicOffer) {
  const price = offer.discounted_price;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: offer.name,
    image: offer.image?.detail_url ?? offer.image?.thumb_url ?? undefined,
    brand: offer.business?.name
      ? { "@type": "Brand", name: offer.business.name }
      : undefined,
    offers:
      price == null
        ? undefined
        : {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: (price / 100).toFixed(2),
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/offers/${offer.id}`,
          },
  };
}
