import Link from "next/link";
import { DiscountBadge } from "@/features/public/price";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import type { ExclusiveItem } from "@/features/offers/api";
import { formatDateShortSq, formatEurFromCents } from "@/lib/format";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export function ExclusiveStage({ items }: { items: ExclusiveItem[] }) {
  const [lead, ...rest] = items;

  return (
    <div className="grid gap-16 sm:gap-24">
      {lead ? <Featured item={lead} /> : null}
      {rest.length > 0 ? <Collection items={rest} /> : null}
    </div>
  );
}

function Featured({ item }: { item: ExclusiveItem }) {
  if (item.kind === "flyer") {
    return <FeaturedFlyer item={item} />;
  }
  return <FeaturedOffer item={item} />;
}

function FeaturedOffer({ item }: { item: Extract<ExclusiveItem, { kind: "offer" }> }) {
  const offer = item.offer;
  const shop = offer.business?.name;
  const percent = offer.discount_percent;
  const sale = offer.discounted_price;
  const original = offer.original_price;

  return (
    <Link
      href={`/offers/${offer.id}`}
      className={`group grid overflow-hidden rounded-[1.75rem] bg-elevated shadow-[0_24px_60px_-36px_var(--color-shadow)] sm:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] ${focus}`}
    >
      <span className="relative block min-h-80 sm:min-h-[32rem]">
        <ProductVisual
          fill
          priority
          name={offer.name}
          imageUrl={offer.image?.detail_url ?? offer.image?.thumb_url}
          sizes="(max-width: 640px) 100vw, 720px"
        />
        {percent != null && percent > 0 ? (
          <span className="absolute top-4 left-4 z-10 sm:top-6 sm:left-6">
            <DiscountBadge percent={percent} />
          </span>
        ) : null}
      </span>
      <span className="flex min-w-0 flex-col justify-center gap-5 px-6 py-8 sm:px-10 sm:py-12">
        {shop ? <ShopMark name={shop} logoUrl={offer.business?.logo_url} /> : null}
        <span className="line-clamp-4 text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] font-extrabold tracking-[-0.045em] text-ink">
          {offer.name}
        </span>
        {sale != null ? (
          <span className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-3xl font-extrabold text-ink tabular-nums sm:text-4xl">
              {formatEurFromCents(sale)}
            </span>
            {original != null && original > sale ? (
              <span className="text-base text-muted line-through tabular-nums">
                {formatEurFromCents(original)}
              </span>
            ) : null}
          </span>
        ) : null}
        <span className="text-sm tracking-wide text-muted">
          Deri më {formatDateShortSq(offer.expires_at)}
        </span>
      </span>
    </Link>
  );
}

function FeaturedFlyer({ item }: { item: Extract<ExclusiveItem, { kind: "flyer" }> }) {
  const folder = item.flyer;
  const shop = folder.business?.name;
  const coverName = folder.cover?.name ?? folder.title;
  const percent = folder.lead_discount_percent;

  return (
    <Link
      href={`/dosje/${folder.id}`}
      className={`group grid overflow-hidden rounded-[1.75rem] bg-elevated shadow-[0_24px_60px_-36px_var(--color-shadow)] sm:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] ${focus}`}
    >
      <span className="relative block min-h-80 sm:min-h-[32rem]">
        <ProductVisual
          fill
          priority
          name={coverName}
          imageUrl={folder.cover?.detail_url ?? folder.cover?.thumb_url}
          sizes="(max-width: 640px) 100vw, 720px"
        />
        <span className="absolute top-4 left-4 z-10 rounded-full bg-ivory px-3 py-1 text-[0.68rem] font-extrabold tracking-[0.14em] text-charcoal uppercase sm:top-6 sm:left-6">
          Fletushkë
        </span>
      </span>
      <span className="flex min-w-0 flex-col justify-center gap-5 px-6 py-8 sm:px-10 sm:py-12">
        {shop ? <ShopMark name={shop} logoUrl={folder.business?.logo_url} /> : null}
        <span className="line-clamp-4 text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] font-extrabold tracking-[-0.045em] text-ink">
          {folder.title}
        </span>
        {percent != null && percent > 0 ? <DiscountBadge percent={percent} /> : null}
      </span>
    </Link>
  );
}

function Collection({ items }: { items: ExclusiveItem[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-10 p-0 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-14">
      {items.map((item, index) =>
        item.kind === "flyer" ? (
          <li key={`flyer:${item.flyer.id}`} className="col-span-2 min-w-0">
            <FlyerTile item={item} eager={index < 2} />
          </li>
        ) : (
          <li key={`offer:${item.offer.id}`} className="min-w-0">
            <OfferTile item={item} eager={index < 4} />
          </li>
        ),
      )}
    </ul>
  );
}

function OfferTile({
  item,
  eager = false,
}: {
  item: Extract<ExclusiveItem, { kind: "offer" }>;
  eager?: boolean;
}) {
  const offer = item.offer;
  const shop = offer.business?.name;

  return (
    <Link href={`/offers/${offer.id}`} className={`group block min-w-0 ${focus}`}>
      <span className="relative block overflow-hidden rounded-2xl bg-elevated">
        <ProductVisual
          name={offer.name}
          imageUrl={offer.image?.thumb_url}
          eager={eager}
          sizes="(max-width: 640px) 50vw, 320px"
          className="aspect-[3/4] w-full"
        />
        {offer.discount_percent != null && offer.discount_percent > 0 ? (
          <span className="absolute top-3 left-3 z-10">
            <DiscountBadge percent={offer.discount_percent} />
          </span>
        ) : null}
      </span>
      <Caption
        shop={shop}
        title={offer.name}
        price={offer.discounted_price}
      />
    </Link>
  );
}

function FlyerTile({
  item,
  eager = false,
}: {
  item: Extract<ExclusiveItem, { kind: "flyer" }>;
  eager?: boolean;
}) {
  const folder = item.flyer;
  const shop = folder.business?.name;
  const coverName = folder.cover?.name ?? folder.title;

  return (
    <Link href={`/dosje/${folder.id}`} className={`group block min-w-0 ${focus}`}>
      <span className="relative block overflow-hidden rounded-2xl bg-elevated">
        <ProductVisual
          name={coverName}
          imageUrl={folder.cover?.thumb_url}
          eager={eager}
          sizes="(max-width: 1024px) 100vw, 640px"
          className="aspect-[16/10] w-full"
        />
        <span className="absolute top-3 left-3 z-10 rounded-full bg-ivory px-2.5 py-1 text-[0.65rem] font-extrabold tracking-[0.14em] text-charcoal uppercase">
          Fletushkë
        </span>
        {folder.lead_discount_percent != null && folder.lead_discount_percent > 0 ? (
          <span className="absolute top-3 right-3 z-10">
            <DiscountBadge percent={folder.lead_discount_percent} />
          </span>
        ) : null}
      </span>
      <Caption shop={shop} title={folder.title} />
    </Link>
  );
}

function Caption({
  shop,
  title,
  price,
}: {
  shop?: string | null;
  title: string;
  price?: number | null;
}) {
  return (
    <span className="mt-3 grid gap-1">
      <span className="truncate text-[0.68rem] font-bold tracking-[0.16em] text-muted uppercase">
        {shop ?? "\u00a0"}
      </span>
      <span className="line-clamp-2 text-base leading-snug font-extrabold tracking-[-0.03em] text-ink group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">
        {title}
      </span>
      {price != null ? (
        <span className="text-sm font-extrabold text-ink tabular-nums">
          {formatEurFromCents(price)}
        </span>
      ) : null}
    </span>
  );
}

function ShopMark({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <ShopLogo name={name} logoUrl={logoUrl} size="sm" />
      <span className="truncate text-[0.72rem] font-bold tracking-[0.16em] text-muted uppercase">
        {name}
      </span>
    </span>
  );
}
