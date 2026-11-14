import { OpenInNewOutlinedIcon } from "@/components/ui/icons";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { OfferPlace } from "@/components/place/OfferPlace";
import { BranchPlaces, PlaceBranchRow } from "@/features/public/BranchPlaces";
import { safeHttpUrl } from "@/features/business/links";
import { Breadcrumbs, isPublicFlyerBundle, offerCrumbs } from "@/features/public/Breadcrumbs";
import { savingsCents } from "@/features/public/compose";
import { Band, Frame, SectionHeading } from "@/features/public/Frame";
import { DiscountBadge, PriceLine } from "@/features/public/price";
import { kicker } from "@/features/public/tone";
import { ProductGrid, ShopLink } from "@/features/public/ProductPoster";
import { ProductVisual } from "@/features/public/visuals";
import { formatDateSq, formatEurFromCents } from "@/lib/format";
import { button } from "@/lib/ui";
import type { PublicOffer } from "@/types";

type OfferDetailProps = {
  offer: PublicOffer;
  related?: PublicOffer[];
  recommended?: PublicOffer[];
};

export function OfferDetail({ offer, related = [], recommended = [] }: OfferDetailProps) {
  const shop = offer.business?.name ?? "Dyqan";
  const flyer = isPublicFlyerBundle(offer.bundle) ? offer.bundle : null;
  const saved = savingsCents(offer.original_price, offer.discounted_price);
  const purchaseHref = safeHttpUrl(offer.purchase_url);

  return (
    <article>
      <Frame className="pt-8">
        <Breadcrumbs items={offerCrumbs(offer)} />
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
          <div className="lg:col-span-7">
            <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-white">
              <ProductVisual
                name={offer.name}
                imageUrl={offer.image?.detail_url}
                priority
                fit="contain"
                sizes="(max-width: 1024px) 100vw, 640px"
                className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[18rem]"
              />
              {offer.discount_percent != null && offer.discount_percent > 0 ? (
                <span className="absolute top-4 left-4 z-10">
                  <DiscountBadge percent={offer.discount_percent} />
                </span>
              ) : null}
              <span className="absolute top-4 right-4 z-20">
                <FavoriteButton
                  kind="offer"
                  id={offer.id}
                  size="md"
                  thumbnailUrl={offer.image?.thumb_url}
                  thumbnailName={offer.name}
                />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-elevated p-5 sm:p-6 lg:col-span-5 dark:border-white/10 dark:bg-[#1a2420]">
            {offer.categories?.length ? (
              <p className={`${kicker} m-0`}>
                {offer.categories.map((category, index) => (
                  <span key={category.id}>
                    {index > 0 ? " · " : null}
                    <Link
                      href={`/oferta?category=${category.slug}`}
                      className="hover:text-ink"
                    >
                      {category.name}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
            <h1 className="m-0 mt-3 text-title-1 break-words line-clamp-4">
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
            {purchaseHref ? (
              <a
                href={purchaseHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${button()} mt-5 w-full sm:w-auto`}
              >
                Bli tani
                <OpenInNewOutlinedIcon sx={{ fontSize: 18 }} aria-hidden />
              </a>
            ) : null}
            <div className="mt-6 border-t border-line pt-5">
              <ShopLink
                name={shop}
                logoUrl={offer.business?.logo_url}
                href={offer.business ? `/biznese/${offer.business.id}` : undefined}
                size="md"
              />
              {flyer ? (
                <Link
                  href={`/dosje/${flyer.id}`}
                  className="mt-4 block text-sm font-extrabold tracking-tight underline-offset-4 hover:underline"
                >
                  Nga fletushka {flyer.title}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </Frame>

      {offer.business ? (
        <Band pad="compact">
          <p className={kicker}>Ku e gjen</p>
          <div className="mt-3 max-w-xl grid gap-3">
            <PlaceBranchRow place={offer.business} />
            <OfferPlace
              surface="plain"
              showHeading={false}
              showPin={false}
              mapClassName="h-72"
              name={offer.business.name}
              place={{
                address: offer.business.address,
                latitude: offer.business.latitude,
                longitude: offer.business.longitude,
              }}
            />
            <BranchPlaces places={offer.also_at} showHeading={false} />
          </div>
        </Band>
      ) : null}

      {related.length > 0 ? (
        <Band>
          <SectionHeading
            kicker="E njëjta fletushkë"
            title={offer.bundle?.title ?? "Oferta të tjera"}
          />
          <ProductGrid offers={related} />
        </Band>
      ) : null}

      {recommended.length > 0 ? (
        <Band>
          <SectionHeading title="Të rekomanduara" />
          <ProductGrid offers={recommended} />
        </Band>
      ) : null}
    </article>
  );
}
