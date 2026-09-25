import Link from "next/link";
import { OfferPlace } from "@/components/place/OfferPlace";
import { savingsCents } from "@/features/public/compose";
import { BackLink, Band, Frame, SectionHeading } from "@/features/public/Frame";
import { DiscountBadge, PriceLine } from "@/features/public/price";
import { display, kicker } from "@/features/public/tone";
import { ProductGrid, ShopLink } from "@/features/public/ProductPoster";
import { ProductVisual } from "@/features/public/visuals";
import { formatDateSq, formatEurFromCents } from "@/lib/format";
import type { PublicOffer } from "@/types";

type OfferDetailProps = {
  offer: PublicOffer;
  related?: PublicOffer[];
};

export function OfferDetail({ offer, related = [] }: OfferDetailProps) {
  const shop = offer.business?.name ?? "Dyqan";
  const backHref = offer.bundle ? `/dosje/${offer.bundle.id}` : "/";
  const backLabel = offer.bundle?.title ?? "Kreu";
  const saved = savingsCents(offer.original_price, offer.discounted_price);

  return (
    <article>
      <Frame className="pt-8">
        <BackLink href={backHref}>{backLabel}</BackLink>
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[1.35rem] border border-line">
              <ProductVisual
                name={offer.name}
                imageUrl={offer.image?.detail_url}
                priority
                sizes="(max-width: 1024px) 100vw, 640px"
                className="aspect-[4/5] w-full"
              />
              {offer.discount_percent != null && offer.discount_percent > 0 ? (
                <span className="absolute top-4 left-4 z-10">
                  <DiscountBadge percent={offer.discount_percent} />
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-elevated p-5 sm:p-6 lg:col-span-5 dark:border-white/10 dark:bg-[#1a2420]">
            {offer.category ? (
              <Link href={`/?category=${offer.category.slug}`} className={`${kicker} hover:text-ink`}>
                {offer.category.name}
              </Link>
            ) : null}
            <h1 className={`m-0 mt-3 text-[clamp(2.2rem,4vw,3.4rem)] ${display}`}>
              {offer.name}
            </h1>
            {offer.discounted_price != null ? (
              <div className="mt-5">
                <PriceLine
                  sale={offer.discounted_price}
                  original={offer.original_price ?? 0}
                  size="xl"
                />
              </div>
            ) : null}
            {saved > 0 ? (
              <p className="mt-3 mb-0 text-sm font-semibold">
                Kurse {formatEurFromCents(saved)}
              </p>
            ) : null}
            <p className="mt-3 mb-0 text-sm text-muted">
              Deri më {formatDateSq(offer.expires_at)}
            </p>
            <div className="mt-6 border-t border-line pt-5">
              <ShopLink
                name={shop}
                logoUrl={offer.business?.logo_url}
                href={offer.business ? `/biznese/${offer.business.id}` : undefined}
                size="md"
              />
              {offer.bundle ? (
                <Link
                  href={`/dosje/${offer.bundle.id}`}
                  className="mt-4 block text-sm font-extrabold tracking-tight underline-offset-4 hover:underline"
                >
                  Nga fletushka {offer.bundle.title}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </Frame>

      {offer.business ? (
        <Band className="pt-10 pb-4">
          <p className="m-0 text-[0.7rem] font-bold tracking-[0.18em] text-muted uppercase">
            Ku e gjen
          </p>
          <h2 className="m-0 mt-2 text-2xl font-extrabold tracking-tight">
            {offer.business.name}
          </h2>
          <div className="mt-5 max-w-xl">
            <OfferPlace
              surface="plain"
              showHeading={false}
              mapClassName="h-72 rounded-[1.5rem]"
              name={offer.business.name}
              place={{
                address: offer.business.address,
                latitude: offer.business.latitude,
                longitude: offer.business.longitude,
              }}
            />
          </div>
        </Band>
      ) : null}

      {related.length > 0 ? (
        <Band>
          <SectionHeading
            kicker="E njëjta fletushkë"
            title={offer.bundle?.title ?? "Produkte të tjera"}
          />
          <ProductGrid offers={related} />
        </Band>
      ) : null}
    </article>
  );
}
