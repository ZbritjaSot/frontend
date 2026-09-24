import Link from "next/link";
import { OfferPlace } from "@/components/place/OfferPlace";
import { savingsCents } from "@/features/public/compose";
import { BackLink, Band, Frame, SectionHeading } from "@/features/public/Frame";
import { ProductGrid, ShopLink } from "@/features/public/ProductPoster";
import { ProductVisual } from "@/features/public/visuals";
import {
  formatDateSq,
  formatDiscountPercent,
  formatEurFromCents,
} from "@/lib/format";
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
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-[1.75rem]">
              <ProductVisual
                name={offer.name}
                imageUrl={offer.image?.detail_url}
                priority
                className="aspect-[4/5] w-full"
              />
            </div>
          </div>

          <div className="lg:col-span-6 lg:pt-4">
            {offer.category ? (
              <Link
                href={`/?category=${offer.category.slug}`}
                className="text-[0.7rem] font-bold tracking-[0.18em] text-muted uppercase hover:text-ink"
              >
                {offer.category.name}
              </Link>
            ) : null}
            <h1 className="m-0 mt-3 text-[clamp(2.2rem,5vw,3.4rem)] leading-[0.98] font-extrabold tracking-[-0.045em]">
              {offer.name}
            </h1>
            <div className="mt-5">
              <ShopLink
                name={shop}
                logoUrl={offer.business?.logo_url}
                href={offer.business ? `/biznese/${offer.business.id}` : undefined}
                size="md"
              />
            </div>
            <p className="m-0 mt-8 flex flex-wrap items-end gap-x-4 gap-y-2">
              <span className="text-[clamp(2.4rem,5vw,3.4rem)] leading-none font-extrabold tracking-[-0.04em] text-ink tabular-nums dark:text-accent">
                {formatEurFromCents(offer.discounted_price)}
              </span>
              <span className="mb-1 text-xl text-muted line-through tabular-nums">
                {formatEurFromCents(offer.original_price)}
              </span>
            </p>
            {saved > 0 ? (
              <p className="mt-3 mb-0 text-sm font-semibold">
                Kurse {formatEurFromCents(saved)}
                {offer.discount_percent > 0
                  ? ` · ${formatDiscountPercent(offer.discount_percent)}`
                  : ""}
              </p>
            ) : null}
            <p className="mt-6 mb-0 text-base text-muted">
              Deri më {formatDateSq(offer.expires_at)}
            </p>
            {offer.bundle ? (
              <p className="mt-6 mb-0">
                <Link
                  href={`/dosje/${offer.bundle.id}`}
                  className="text-sm font-extrabold tracking-tight underline-offset-4 hover:underline"
                >
                  Nga fletushka {offer.bundle.title}
                </Link>
              </p>
            ) : null}
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
