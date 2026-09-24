import Link from "next/link";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import { formatDateSq, formatDiscountPercent, formatEurFromCents } from "@/lib/format";
import type { PublicOffer } from "@/types";

export function ProductPoster({
  offer,
  emphasis = false,
  eager = false,
}: {
  offer: PublicOffer;
  emphasis?: boolean;
  eager?: boolean;
}) {
  const shop = offer.business?.name;

  return (
    <Link href={`/offers/${offer.id}`} className="group block min-w-0">
      <span className="relative block overflow-hidden rounded-[1.25rem]">
        <ProductVisual
          name={offer.name}
          imageUrl={offer.image?.thumb_url}
          eager={eager}
          className={`w-full transition duration-700 ease-out group-hover:scale-[1.04] ${
            emphasis ? "aspect-[4/5]" : "aspect-[4/5] sm:aspect-[5/6]"
          }`}
        />
      </span>
      <span className="mt-3 block">
        {shop ? (
          <span className="block truncate text-sm text-muted">{shop}</span>
        ) : null}
        <span
          className={`mt-1 block leading-snug font-extrabold tracking-[-0.03em] text-ink underline-offset-4 group-hover:underline group-hover:decoration-accent ${
            emphasis ? "text-[clamp(1.35rem,2vw,1.85rem)]" : "text-base"
          }`}
        >
          {offer.name}
        </span>
        <span className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className={`font-extrabold tabular-nums text-ink dark:text-accent ${
              emphasis ? "text-2xl" : "text-lg"
            }`}
          >
            {formatEurFromCents(offer.discounted_price)}
          </span>
          <span className="text-sm text-muted line-through tabular-nums">
            {formatEurFromCents(offer.original_price)}
          </span>
          {offer.discount_percent > 0 ? (
            <span className="text-sm font-bold tabular-nums text-ink">
              {formatDiscountPercent(offer.discount_percent)}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}

export function ProductGrid({ offers }: { offers: PublicOffer[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-12 p-0 sm:gap-x-6 lg:grid-cols-3">
      {offers.map((offer) => (
        <li key={offer.id}>
          <ProductPoster offer={offer} />
        </li>
      ))}
    </ul>
  );
}

export function OfferRow({ offer }: { offer: PublicOffer }) {
  const shop = offer.business?.name;

  return (
    <Link
      href={`/offers/${offer.id}`}
      className="group -mx-2 flex items-center gap-4 rounded-xl px-2 py-4 hover:bg-hover"
    >
      <ProductVisual
        name={offer.name}
        imageUrl={offer.image?.thumb_url}
        className="size-20 shrink-0 rounded-2xl"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-extrabold tracking-tight underline-offset-4 group-hover:underline group-hover:decoration-accent">
          {offer.name}
        </span>
        <span className="mt-1 block truncate text-sm text-muted">
          {shop ? `${shop} · ` : ""}
          deri më {formatDateSq(offer.expires_at)}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-base font-extrabold tabular-nums dark:text-accent">
          {formatEurFromCents(offer.discounted_price)}
        </span>
        {offer.discount_percent > 0 ? (
          <span className="mt-1 block text-xs font-bold text-muted">
            {formatDiscountPercent(offer.discount_percent)}
          </span>
        ) : null}
      </span>
    </Link>
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
      className="inline-flex min-w-0 items-center gap-3 rounded-full px-1 py-1 hover:bg-hover"
    >
      {inner}
    </Link>
  );
}
