import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import {
  ExclusiveDiscount,
  ExclusiveMark,
  exclusiveFocus,
  exclusiveShell,
} from "@/features/public/exclusiveChrome";
import { PriceLine } from "@/features/public/price";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import type { ExclusiveItem } from "@/features/offers/api";
import { formatDateShortSq } from "@/lib/format";

export function ExclusiveCard({
  item,
  layout,
}: {
  item: ExclusiveItem;
  layout: "rail" | "tile" | "feature";
}) {
  if (item.kind === "flyer") {
    return <FlyerCard item={item} layout={layout} />;
  }

  return <OfferCard item={item} layout={layout} />;
}

function OfferCard({
  item,
  layout,
}: {
  item: Extract<ExclusiveItem, { kind: "offer" }>;
  layout: "rail" | "tile" | "feature";
}) {
  const offer = item.offer;
  const shop = offer.business?.name;
  const onForest = layout === "rail";
  const width =
    layout === "rail" ? "w-44 shrink-0 snap-start sm:w-52" : "block min-w-0";

  if (layout === "feature") {
    return (
      <Link
        href={`/offers/${offer.id}`}
        className={`group grid sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] ${exclusiveShell.featured} ${exclusiveFocus}`}
      >
        <span className="relative block min-h-56 sm:min-h-72">
          <ProductVisual
            fill
            eager
            name={offer.name}
            imageUrl={offer.image?.detail_url ?? offer.image?.thumb_url}
            sizes="(max-width: 640px) 100vw, 520px"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-3 rounded-xl ring-1 ring-accent/20"
          />
          <span className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
            <ExclusiveMark size="md" />
            {offer.discount_percent != null && offer.discount_percent > 0 ? (
              <ExclusiveDiscount percent={offer.discount_percent} />
            ) : null}
          </span>
          <span className="absolute top-3 right-3 z-20">
            <FavoriteButton kind="offer" id={offer.id} />
          </span>
        </span>
        <span className="flex min-w-0 flex-col justify-center gap-3 border-t border-accent/30 px-5 py-6 sm:border-t-0 sm:border-l sm:px-8">
          {shop ? (
            <ShopLine name={shop} logoUrl={offer.business?.logo_url} forest />
          ) : null}
          <span className="line-clamp-3 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.05] font-extrabold tracking-[-0.04em]">
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
          <span className="text-sm text-ivory/70">
            Deri më {formatDateShortSq(offer.expires_at)}
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link href={`/offers/${offer.id}`} className={`${width} ${exclusiveFocus}`}>
      <span className={`relative block ${exclusiveShell.offerFrame} !rounded-2xl`}>
        <ProductVisual
          name={offer.name}
          imageUrl={offer.image?.thumb_url}
          eager
          sizes={layout === "rail" ? "208px" : "(max-width: 640px) 50vw, 280px"}
          className="aspect-[3/4] w-full"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-1.5 rounded-[0.85rem] ring-1 ring-accent/15"
        />
        <span className="absolute top-2 left-2 z-10 flex flex-wrap items-center gap-1">
          {onForest ? <ExclusiveMark size="sm" /> : <ExclusiveMark size="sm" tone="on-light" />}
          {offer.discount_percent != null && offer.discount_percent > 0 ? (
            <ExclusiveDiscount percent={offer.discount_percent} />
          ) : null}
        </span>
        <span className="absolute top-2 right-2 z-20">
          <FavoriteButton kind="offer" id={offer.id} />
        </span>
      </span>
      <span
        className={`mt-2.5 block truncate text-sm font-extrabold tracking-tight ${
          onForest ? "text-ivory" : "text-ink"
        }`}
      >
        {offer.name}
      </span>
      {offer.discounted_price != null ? (
        <span className="mt-1 block">
          <PriceLine
            sale={offer.discounted_price}
            original={offer.original_price ?? 0}
            size="sm"
            tone={onForest ? "inverse" : "default"}
          />
        </span>
      ) : null}
      {shop ? (
        <ShopLine name={shop} logoUrl={offer.business?.logo_url} forest={onForest} />
      ) : null}
    </Link>
  );
}

function FlyerCard({
  item,
  layout,
}: {
  item: Extract<ExclusiveItem, { kind: "flyer" }>;
  layout: "rail" | "tile" | "feature";
}) {
  const folder = item.flyer;
  const shop = folder.business?.name;
  const coverName = folder.cover?.name ?? folder.title;
  const onForest = layout === "rail";
  const width =
    layout === "rail" ? "w-44 shrink-0 snap-start sm:w-52" : "block min-w-0";

  if (layout === "feature") {
    return (
      <Link
        href={`/dosje/${folder.id}`}
        className={`group grid sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] ${exclusiveShell.featured} ${exclusiveFocus}`}
      >
        <span className="relative block min-h-56 sm:min-h-72">
          <ProductVisual
            fill
            eager
            name={coverName}
            imageUrl={folder.cover?.detail_url ?? folder.cover?.thumb_url}
            sizes="(max-width: 640px) 100vw, 520px"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-3 rounded-xl ring-1 ring-accent/20"
          />
          <span className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
            <ExclusiveMark size="md" />
            <span className="rounded-full border border-ivory/30 bg-ivory/95 px-2 py-0.5 text-[0.58rem] font-extrabold tracking-tight text-charcoal uppercase">
              Fletushkë
            </span>
          </span>
          <span className="absolute top-3 right-3 z-20">
            <FavoriteButton kind="flyer" id={folder.id} />
          </span>
        </span>
        <span className="flex min-w-0 flex-col justify-center gap-3 border-t border-accent/30 px-5 py-6 sm:border-t-0 sm:border-l sm:px-8">
          {shop ? (
            <ShopLine name={shop} logoUrl={folder.business?.logo_url} forest />
          ) : null}
          <span className="line-clamp-3 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.05] font-extrabold tracking-[-0.04em]">
            {folder.title}
          </span>
          {folder.lead_discount_percent != null && folder.lead_discount_percent > 0 ? (
            <ExclusiveDiscount percent={folder.lead_discount_percent} />
          ) : null}
        </span>
      </Link>
    );
  }

  return (
    <Link href={`/dosje/${folder.id}`} className={`${width} ${exclusiveFocus}`}>
      <span className={`relative block ${exclusiveShell.offerFrame} !rounded-2xl`}>
        <ProductVisual
          name={coverName}
          imageUrl={folder.cover?.thumb_url}
          eager
          sizes={layout === "rail" ? "208px" : "(max-width: 640px) 100vw, 360px"}
          className="aspect-[3/4] w-full"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-1.5 rounded-[0.85rem] ring-1 ring-accent/15"
        />
        <span className="absolute top-2 left-2 z-10 flex flex-wrap items-center gap-1">
          {onForest ? <ExclusiveMark size="sm" /> : <ExclusiveMark size="sm" tone="on-light" />}
          <span className="rounded-full bg-ivory px-2 py-0.5 text-[0.58rem] font-extrabold tracking-tight text-charcoal uppercase">
            Fletushkë
          </span>
        </span>
        {folder.lead_discount_percent != null && folder.lead_discount_percent > 0 ? (
          <span className="absolute top-2 right-2 z-10">
            <ExclusiveDiscount percent={folder.lead_discount_percent} />
          </span>
        ) : null}
        <span className="absolute bottom-2 right-2 z-20">
          <FavoriteButton kind="flyer" id={folder.id} />
        </span>
      </span>
      <span
        className={`mt-2.5 block truncate text-sm font-extrabold tracking-tight ${
          onForest ? "text-ivory" : "text-ink"
        }`}
      >
        {folder.title}
      </span>
      {shop ? (
        <ShopLine name={shop} logoUrl={folder.business?.logo_url} forest={onForest} />
      ) : null}
    </Link>
  );
}

function ShopLine({
  name,
  logoUrl,
  forest,
}: {
  name: string;
  logoUrl?: string | null;
  forest: boolean;
}) {
  return (
    <span className="mt-1.5 flex min-w-0 items-center gap-1.5">
      <ShopLogo name={name} logoUrl={logoUrl} size="sm" />
      <span
        className={`truncate text-[0.68rem] font-bold tracking-[0.12em] uppercase ${
          forest ? "text-ivory/75" : "text-muted"
        }`}
      >
        {name}
      </span>
    </span>
  );
}
