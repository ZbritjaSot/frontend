import Link from "next/link";
import { DiscoverForm } from "@/features/public/DiscoverForm";
import { Frame } from "@/features/public/Frame";
import { ProductVisual } from "@/features/public/visuals";
import { formatDiscountPercent, formatEurFromCents } from "@/lib/format";
import type { CategorySummary, PublicOffer } from "@/types";

export function HeroSection({
  categories,
  hero,
}: {
  categories: CategorySummary[];
  hero: PublicOffer | null;
}) {
  return (
    <Frame className="pt-10 pb-6 sm:pt-14">
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.82fr)] lg:gap-20">
        <div className="lg:pt-8">
          <p className="m-0 text-sm font-semibold text-muted">Kosovë</p>
          <h1 className="m-0 mt-3 max-w-xl text-[clamp(2.7rem,7vw,4.75rem)] leading-[0.9] font-extrabold tracking-[-0.05em]">
            Zbritjet e ditës, pranë teje.
          </h1>
          <p className="mt-5 mb-0 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Shfleto fletushkat, krahaso çmimet dhe zgjidh para se të mbarojë afati.
          </p>
          <div className="mt-8">
            <DiscoverForm categories={categories} />
          </div>
        </div>
        {hero ? <HeroOffer offer={hero} /> : null}
      </div>
    </Frame>
  );
}

function HeroOffer({ offer }: { offer: PublicOffer }) {
  const shop = offer.business?.name;

  return (
    <Link href={`/offers/${offer.id}`} className="group block">
      <span className="block overflow-hidden rounded-[1.6rem]">
        <ProductVisual
          name={offer.name}
          className="aspect-[5/4] w-full transition duration-700 ease-out group-hover:scale-105 sm:aspect-[4/5]"
        />
      </span>
      <span className="mt-4 flex items-baseline justify-between gap-4">
        {offer.discount_percent > 0 ? (
          <span className="text-4xl leading-none font-extrabold tracking-[-0.04em] text-ink">
            {formatDiscountPercent(offer.discount_percent)}
          </span>
        ) : (
          <span />
        )}
        {shop ? <span className="truncate text-sm text-muted">{shop}</span> : null}
      </span>
      <span className="mt-2 block text-2xl leading-tight font-extrabold tracking-[-0.03em] underline-offset-4 group-hover:underline group-hover:decoration-accent">
        {offer.name}
      </span>
      <span className="mt-2 flex items-baseline gap-3">
        <span className="text-xl font-extrabold tabular-nums dark:text-accent">
          {formatEurFromCents(offer.discounted_price)}
        </span>
        <span className="text-sm text-muted line-through tabular-nums">
          {formatEurFromCents(offer.original_price)}
        </span>
      </span>
    </Link>
  );
}
