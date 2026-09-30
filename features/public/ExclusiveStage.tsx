import Link from "next/link";
import type { ReactNode } from "react";
import { PriceLine } from "@/features/public/price";
import {
  ExclusiveDiscount,
  ExclusiveMark,
  exclusiveFocus,
  exclusiveShell,
} from "@/features/public/exclusiveChrome";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import type { ExclusiveItem } from "@/features/offers/api";
import { formatDateShortSq } from "@/lib/format";

export function ExclusiveStage({ items }: { items: ExclusiveItem[] }) {
  if (items.length === 0) {
    return null;
  }

  const [lead, second, third, ...rest] = items;
  const pair = [second, third].filter((item): item is ExclusiveItem => item != null);
  const flyers = rest.filter(
    (item): item is Extract<ExclusiveItem, { kind: "flyer" }> => item.kind === "flyer",
  );
  const offers = rest.filter(
    (item): item is Extract<ExclusiveItem, { kind: "offer" }> => item.kind === "offer",
  );

  return (
    <div className="grid gap-12 sm:gap-16 lg:gap-20">
      {lead ? <Featured item={lead} /> : null}

      {pair.length > 0 ? (
        <div
          className={`grid gap-5 sm:gap-6 ${
            pair.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {pair.map((item) => (
            <Spotlight key={itemKey(item)} item={item} />
          ))}
        </div>
      ) : null}

      {flyers.length > 0 ? (
        <section className="grid gap-5">
          <p className="m-0 text-[0.68rem] font-bold tracking-[0.2em] text-muted uppercase">
            Fletushkat
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {flyers.map((item) => (
              <FlyerWide key={itemKey(item)} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {offers.length > 0 ? (
        <section className="grid gap-5">
          {lead || pair.length > 0 || flyers.length > 0 ? (
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.2em] text-muted uppercase">
              Ofertat
            </p>
          ) : null}
          <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-10 p-0 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-7 lg:gap-y-12">
            {offers.map((item, index) => (
              <li key={itemKey(item)} className="min-w-0">
                <OfferTile item={item} eager={index < 6} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function itemKey(item: ExclusiveItem): string {
  return item.kind === "flyer" ? `flyer:${item.flyer.id}` : `offer:${item.offer.id}`;
}

function ImageFrame({ children }: { children: ReactNode }) {
  return (
    <span className="relative block h-full min-h-inherit overflow-hidden">
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-xl ring-1 ring-accent/20 sm:inset-4"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-forest/25 via-transparent to-transparent"
      />
    </span>
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
      className={`group grid lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)] ${exclusiveShell.featured} ${exclusiveFocus}`}
    >
      <span className="relative block min-h-72 sm:min-h-[28rem] lg:min-h-[32rem]">
        <ImageFrame>
          <ProductVisual
            fill
            priority
            name={offer.name}
            imageUrl={offer.image?.detail_url ?? offer.image?.thumb_url}
            sizes="(max-width: 1024px) 100vw, 820px"
          />
        </ImageFrame>
        <span className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 sm:top-6 sm:left-6">
          <ExclusiveMark size="lg" />
          {percent != null && percent > 0 ? <ExclusiveDiscount percent={percent} /> : null}
        </span>
      </span>
      <span className="relative flex min-w-0 flex-col justify-center gap-5 border-t border-accent/30 px-6 py-8 sm:px-10 sm:py-12 lg:border-t-0 lg:border-l">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,255,0,0.08),transparent_55%)]"
        />
        {shop ? <ShopMark name={shop} logoUrl={offer.business?.logo_url} /> : null}
        <span className="relative line-clamp-4 text-[clamp(1.9rem,3.8vw,3.2rem)] leading-[0.98] font-extrabold tracking-[-0.045em] text-ivory">
          {offer.name}
        </span>
        {sale != null ? (
          <span className="relative">
            <PriceLine sale={sale} original={original ?? 0} size="xl" tone="inverse" />
          </span>
        ) : null}
        <span className="relative text-sm tracking-wide text-ivory/70">
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
      className={`group grid lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)] ${exclusiveShell.featured} ${exclusiveFocus}`}
    >
      <span className="relative block min-h-72 sm:min-h-[28rem] lg:min-h-[32rem]">
        <ImageFrame>
          <ProductVisual
            fill
            priority
            name={coverName}
            imageUrl={folder.cover?.detail_url ?? folder.cover?.thumb_url}
            sizes="(max-width: 1024px) 100vw, 820px"
          />
        </ImageFrame>
        <span className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 sm:top-6 sm:left-6">
          <ExclusiveMark size="lg" />
          <span className="rounded-full border border-ivory/30 bg-ivory/95 px-2.5 py-0.5 text-[0.62rem] font-extrabold tracking-[0.14em] text-charcoal uppercase">
            Fletushkë
          </span>
          {percent != null && percent > 0 ? <ExclusiveDiscount percent={percent} /> : null}
        </span>
      </span>
      <span className="relative flex min-w-0 flex-col justify-center gap-5 border-t border-accent/30 px-6 py-8 sm:px-10 sm:py-12 lg:border-t-0 lg:border-l">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,255,0,0.08),transparent_55%)]"
        />
        {shop ? <ShopMark name={shop} logoUrl={folder.business?.logo_url} /> : null}
        <span className="relative line-clamp-4 text-[clamp(1.9rem,3.8vw,3.2rem)] leading-[0.98] font-extrabold tracking-[-0.045em] text-ivory">
          {folder.title}
        </span>
      </span>
    </Link>
  );
}

function Spotlight({ item }: { item: ExclusiveItem }) {
  if (item.kind === "flyer") {
    return <SpotlightFlyer item={item} />;
  }
  return <SpotlightOffer item={item} />;
}

function SpotlightOffer({ item }: { item: Extract<ExclusiveItem, { kind: "offer" }> }) {
  const offer = item.offer;
  const shop = offer.business?.name;

  return (
    <Link
      href={`/offers/${offer.id}`}
      className={`group grid sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] ${exclusiveShell.spotlight} ${exclusiveFocus}`}
    >
      <span className="relative block min-h-56 sm:min-h-full">
        <ImageFrame>
          <ProductVisual
            fill
            eager
            name={offer.name}
            imageUrl={offer.image?.detail_url ?? offer.image?.thumb_url}
            sizes="(max-width: 640px) 100vw, 420px"
          />
        </ImageFrame>
        <span className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
          <ExclusiveMark size="md" />
          {offer.discount_percent != null && offer.discount_percent > 0 ? (
            <ExclusiveDiscount percent={offer.discount_percent} />
          ) : null}
        </span>
      </span>
      <span className="relative flex min-w-0 flex-col justify-center gap-3 border-t border-accent/25 px-5 py-6 sm:border-t-0 sm:border-l sm:px-7">
        {shop ? <ShopMark name={shop} logoUrl={offer.business?.logo_url} /> : null}
        <span className="line-clamp-3 text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-ivory">
          {offer.name}
        </span>
        {offer.discounted_price != null ? (
          <PriceLine
            sale={offer.discounted_price}
            original={offer.original_price ?? 0}
            size="lg"
            tone="inverse"
          />
        ) : null}
      </span>
    </Link>
  );
}

function SpotlightFlyer({ item }: { item: Extract<ExclusiveItem, { kind: "flyer" }> }) {
  const folder = item.flyer;
  const shop = folder.business?.name;
  const coverName = folder.cover?.name ?? folder.title;

  return (
    <Link
      href={`/dosje/${folder.id}`}
      className={`group grid sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] ${exclusiveShell.spotlight} ${exclusiveFocus}`}
    >
      <span className="relative block min-h-56 sm:min-h-full">
        <ImageFrame>
          <ProductVisual
            fill
            eager
            name={coverName}
            imageUrl={folder.cover?.detail_url ?? folder.cover?.thumb_url}
            sizes="(max-width: 640px) 100vw, 420px"
          />
        </ImageFrame>
        <span className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
          <ExclusiveMark size="md" />
          <span className="rounded-full border border-ivory/30 bg-ivory/95 px-2 py-0.5 text-[0.58rem] font-extrabold tracking-[0.14em] text-charcoal uppercase">
            Fletushkë
          </span>
        </span>
      </span>
      <span className="relative flex min-w-0 flex-col justify-center gap-3 border-t border-accent/25 px-5 py-6 sm:border-t-0 sm:border-l sm:px-7">
        {shop ? <ShopMark name={shop} logoUrl={folder.business?.logo_url} /> : null}
        <span className="line-clamp-3 text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-ivory">
          {folder.title}
        </span>
        {folder.lead_discount_percent != null && folder.lead_discount_percent > 0 ? (
          <ExclusiveDiscount percent={folder.lead_discount_percent} />
        ) : null}
      </span>
    </Link>
  );
}

function FlyerWide({ item }: { item: Extract<ExclusiveItem, { kind: "flyer" }> }) {
  const folder = item.flyer;
  const shop = folder.business?.name;
  const coverName = folder.cover?.name ?? folder.title;

  return (
    <Link href={`/dosje/${folder.id}`} className={`group ${exclusiveShell.flyer} ${exclusiveFocus}`}>
      <span className="relative block aspect-[16/10] w-full">
        <ImageFrame>
          <ProductVisual
            fill
            eager
            name={coverName}
            imageUrl={folder.cover?.thumb_url}
            sizes="(max-width: 1024px) 100vw, 560px"
          />
        </ImageFrame>
        <span className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
          <ExclusiveMark size="sm" />
          <span className="rounded-full border border-ivory/30 bg-ivory/95 px-2 py-0.5 text-[0.58rem] font-extrabold tracking-[0.14em] text-charcoal uppercase">
            Fletushkë
          </span>
        </span>
        {folder.lead_discount_percent != null && folder.lead_discount_percent > 0 ? (
          <span className="absolute top-3 right-3 z-10">
            <ExclusiveDiscount percent={folder.lead_discount_percent} />
          </span>
        ) : null}
      </span>
      <span className="grid gap-2 border-t border-accent/25 px-5 py-4">
        {shop ? <ShopMark name={shop} logoUrl={folder.business?.logo_url} /> : null}
        <span className="line-clamp-2 text-xl leading-snug font-extrabold tracking-[-0.03em]">
          {folder.title}
        </span>
      </span>
    </Link>
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
    <Link href={`/offers/${offer.id}`} className={`group block min-w-0 ${exclusiveFocus}`}>
      <span className={`block ${exclusiveShell.offerFrame}`}>
        <ProductVisual
          name={offer.name}
          imageUrl={offer.image?.thumb_url}
          eager={eager}
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 280px"
          className="aspect-[3/4] w-full"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-2 rounded-[0.9rem] ring-1 ring-accent/15"
        />
        <span className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1">
          <ExclusiveMark size="sm" tone="on-light" />
          {offer.discount_percent != null && offer.discount_percent > 0 ? (
            <ExclusiveDiscount percent={offer.discount_percent} />
          ) : null}
        </span>
      </span>
      <span className="mt-3 grid gap-1.5">
        {shop ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <ShopLogo name={shop} logoUrl={offer.business?.logo_url} size="sm" />
            <span className="truncate text-[0.68rem] font-bold tracking-[0.16em] text-muted uppercase">
              {shop}
            </span>
          </span>
        ) : null}
        <span className="line-clamp-2 text-base leading-snug font-extrabold tracking-[-0.03em] text-ink group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">
          {offer.name}
        </span>
        {offer.discounted_price != null ? (
          <PriceLine
            sale={offer.discounted_price}
            original={offer.original_price ?? 0}
            size="sm"
          />
        ) : null}
      </span>
    </Link>
  );
}

function ShopMark({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  return (
    <span className="relative flex min-w-0 items-center gap-2.5">
      <ShopLogo name={name} logoUrl={logoUrl} size="sm" />
      <span className="truncate text-[0.72rem] font-bold tracking-[0.16em] text-accent uppercase">
        {name}
      </span>
    </span>
  );
}
