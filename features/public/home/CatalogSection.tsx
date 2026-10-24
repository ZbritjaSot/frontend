import Link from "next/link";
import { Frame, SeeAll } from "@/features/public/Frame";
import { ProductGrid } from "@/features/public/ProductPoster";
import { DiscountBadge, PriceLine } from "@/features/public/price";
import { kicker } from "@/features/public/tone";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import { formatDateShortSq } from "@/lib/format";
import type { PublicOffer } from "@/types";

export function CatalogSection({
  latest,
  soon,
  freshTitle = "Sapo u shtuan",
  endingTitle = "Mbaron së shpejti",
}: {
  latest: PublicOffer[];
  soon: PublicOffer[];
  freshTitle?: string;
  endingTitle?: string;
}) {
  if (latest.length === 0 && soon.length === 0) {
    return null;
  }

  return (
    <>
      {latest.length > 0 ? (
        <Frame className="pt-10 sm:pt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={kicker}>Të reja</p>
              <h2 className="m-0 mt-1 text-2xl leading-none font-extrabold tracking-[-0.04em] sm:text-3xl">
                {freshTitle}
              </h2>
            </div>
            <SeeAll href="/oferta">Shiko të gjitha</SeeAll>
          </div>
          <ProductGrid offers={latest} eager />
        </Frame>
      ) : null}

      {soon.length > 0 ? (
        <section className="mt-10 bg-mist sm:mt-12 dark:bg-transparent">
          <Frame className="py-8 sm:py-10">
            <p className={kicker}>Afati</p>
            <h2 className="m-0 mt-1 text-2xl leading-none font-extrabold tracking-[-0.04em] sm:text-3xl">
              {endingTitle}
            </h2>
            <ul className="m-0 mt-4 list-none p-0">
              {soon.map((offer) => (
                <li key={offer.id} className="border-t border-line">
                  <UrgentRow offer={offer} />
                </li>
              ))}
            </ul>
          </Frame>
        </section>
      ) : null}
    </>
  );
}

function UrgentRow({ offer }: { offer: PublicOffer }) {
  return (
    <Link
      href={`/offers/${offer.id}`}
      className="flex min-h-11 items-center gap-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <ProductVisual
        name={offer.name}
        imageUrl={offer.image?.thumb_url}
        sizes="56px"
        className="size-14 shrink-0 rounded-xl"
      />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-sm font-extrabold">
            {offer.name}
          </span>
          {offer.discount_percent != null && offer.discount_percent > 0 ? (
            <span className="shrink-0">
              <DiscountBadge percent={offer.discount_percent} />
            </span>
          ) : null}
        </span>
        {offer.business?.name ? (
          <span className="mt-1.5 flex min-w-0 items-center gap-1.5">
            <ShopLogo
              name={offer.business.name}
              logoUrl={offer.business.logo_url}
              size="xs"
            />
            <span className="min-w-0 truncate text-xs font-extrabold tracking-tight text-ink">
              {offer.business.name}
            </span>
          </span>
        ) : (
          <span className="mt-1.5 block min-w-0 truncate text-xs text-muted">
            {"\u00a0"}
          </span>
        )}
      </span>
      <span className="w-28 shrink-0 text-right">
        <span className="block truncate text-xs font-bold text-muted tabular-nums">
          {formatDateShortSq(offer.expires_at)}
        </span>
        {offer.discounted_price != null ? (
          <PriceLine
            sale={offer.discounted_price}
            original={offer.original_price ?? 0}
            size="sm"
            stack
          />
        ) : null}
      </span>
    </Link>
  );
}
