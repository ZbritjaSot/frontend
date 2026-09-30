import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { DiscountBadge, PriceLine } from "@/features/public/price";
import { media } from "@/features/public/tone";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import { formatDateShortSq } from "@/lib/format";
import type { PublicOffer } from "@/types";

const cardLink =
  "group block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

type PosterTone = "standard" | "feature";

export function ProductPoster({
  offer,
  emphasis = false,
  eager = false,
  priority = false,
  tone = "standard",
}: {
  offer: PublicOffer;
  emphasis?: boolean;
  eager?: boolean;
  priority?: boolean;
  tone?: PosterTone;
}) {
  const shop = offer.business?.name;
  const resolved = emphasis ? "feature" : tone;

  return (
    <div className="relative min-w-0">
      <Link href={`/offers/${offer.id}`} className={cardLink}>
        <span className={`relative block border border-line bg-elevated ${media}`}>
          <ProductVisual
            name={offer.name}
            imageUrl={offer.image?.thumb_url}
            eager={eager}
            priority={priority}
            sizes="(max-width: 640px) 50vw, 280px"
            className="aspect-square w-full"
          />
          {offer.discount_percent != null && offer.discount_percent > 0 ? (
            <span className="absolute top-2 left-2 z-10">
              <DiscountBadge percent={offer.discount_percent} />
            </span>
          ) : null}
        </span>
        <span className="mt-2 grid gap-0.5">
          <span className="block h-4 truncate text-[0.68rem] font-bold tracking-[0.12em] text-muted uppercase">
            {shop ?? "\u00a0"}
          </span>
          <span
            className={`line-clamp-2 h-10 overflow-hidden font-extrabold leading-5 tracking-tight text-ink ${
              resolved === "feature" ? "text-base" : "text-sm"
            }`}
          >
            {offer.name}
          </span>
          {offer.discounted_price != null ? (
            <PriceLine
              sale={offer.discounted_price}
              original={offer.original_price ?? 0}
              size="sm"
            />
          ) : (
            <span className="block h-5" />
          )}
          <span className="block h-4 truncate text-xs text-muted">
            Deri më {formatDateShortSq(offer.expires_at)}
          </span>
        </span>
      </Link>
      <span className="absolute top-2 right-2 z-20">
        <FavoriteButton kind="offer" id={offer.id} />
      </span>
    </div>
  );
}

export function ProductGrid({
  offers,
  eager = false,
  priorityFirst = false,
}: {
  offers: PublicOffer[];
  eager?: boolean;
  /** The first card is the page's large photo. Later cards in the first row load immediately. */
  priorityFirst?: boolean;
}) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-5 p-0 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
      {offers.map((offer, index) => (
        <li key={offer.id} className="min-w-0">
          <ProductPoster
            offer={offer}
            eager={eager || (priorityFirst && index < 4)}
            priority={priorityFirst && index === 0}
          />
        </li>
      ))}
    </ul>
  );
}

/** Flat product rows for flyer detail — no category grouping. */
export function ProductList({ offers }: { offers: PublicOffer[] }) {
  return (
    <ul className="m-0 grid list-none divide-y divide-line p-0">
      {offers.map((offer) => (
        <li key={offer.id}>
          <div className="relative">
            <Link
              href={`/offers/${offer.id}`}
              className={`${cardLink} flex items-center gap-4 py-4`}
            >
              <span className={`relative block size-20 shrink-0 overflow-hidden border border-line bg-elevated sm:size-24 ${media}`}>
                <ProductVisual
                  name={offer.name}
                  imageUrl={offer.image?.thumb_url}
                  sizes="96px"
                  className="size-full"
                />
                {offer.discount_percent != null && offer.discount_percent > 0 ? (
                  <span className="absolute top-1 left-1 z-10 scale-90">
                    <DiscountBadge percent={offer.discount_percent} />
                  </span>
                ) : null}
              </span>
              <span className="grid min-w-0 flex-1 gap-1">
                <span className="line-clamp-2 text-base font-extrabold leading-5 tracking-tight text-ink">
                  {offer.name}
                </span>
                {offer.discounted_price != null ? (
                  <PriceLine
                    sale={offer.discounted_price}
                    original={offer.original_price ?? 0}
                    size="sm"
                  />
                ) : null}
                <span className="truncate text-xs text-muted">
                  Deri më {formatDateShortSq(offer.expires_at)}
                </span>
              </span>
            </Link>
            <span className="absolute top-5 right-1 z-20 scale-90 sm:top-6">
              <FavoriteButton kind="offer" id={offer.id} />
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ShopLink({
  name,
  logoUrl,
  href,
  size = "sm",
}: {
  name: string;
  logoUrl?: string | null;
  href?: string;
  size?: "sm" | "md" | "lg";
}) {
  const inner = (
    <>
      <ShopLogo name={name} logoUrl={logoUrl} size={size} />
      <span className="min-w-0 truncate font-bold tracking-tight">{name}</span>
    </>
  );

  if (!href) {
    return <span className="inline-flex min-w-0 items-center gap-3">{inner}</span>;
  }

  return (
    <Link
      href={href}
      className="inline-flex min-h-11 min-w-0 items-center gap-3 rounded-full px-1 py-1 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {inner}
    </Link>
  );
}
