import Link from "next/link";
import { DiscountBadge } from "@/features/public/price";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import type { ExclusiveItem } from "@/features/offers/api";
import { formatDateShortSq, formatEurFromCents } from "@/lib/format";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

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
    layout === "rail" ? "w-40 shrink-0 snap-start sm:w-48" : "block min-w-0";

  if (layout === "feature") {
    return (
      <Link
        href={`/offers/${offer.id}`}
        className={`group grid overflow-hidden rounded-[1.75rem] bg-forest text-ivory sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] dark:bg-[#121816] dark:text-ink ${focus}`}
      >
        <span className="relative block min-h-56 sm:min-h-72">
          <ProductVisual
            fill
            eager
            name={offer.name}
            imageUrl={offer.image?.detail_url ?? offer.image?.thumb_url}
            sizes="(max-width: 640px) 100vw, 520px"
          />
          {offer.discount_percent != null && offer.discount_percent > 0 ? (
            <span className="absolute top-3 left-3 z-10">
              <DiscountBadge percent={offer.discount_percent} />
            </span>
          ) : null}
        </span>
        <span className="flex min-w-0 flex-col justify-center gap-3 px-5 py-6 sm:px-8">
          {shop ? (
            <ShopLine name={shop} logoUrl={offer.business?.logo_url} forest />
          ) : null}
          <span className="line-clamp-3 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.05] font-extrabold tracking-[-0.04em]">
            {offer.name}
          </span>
          {offer.discounted_price != null ? (
            <span className="text-2xl font-extrabold text-accent tabular-nums">
              {formatEurFromCents(offer.discounted_price)}
            </span>
          ) : null}
          <span className="text-sm text-ivory/70 dark:text-muted">
            Deri më {formatDateShortSq(offer.expires_at)}
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link href={`/offers/${offer.id}`} className={`${width} ${focus}`}>
      <span className="relative block overflow-hidden rounded-2xl ring-1 ring-accent/40">
        <ProductVisual
          name={offer.name}
          imageUrl={offer.image?.thumb_url}
          eager
          sizes={layout === "rail" ? "192px" : "(max-width: 640px) 50vw, 280px"}
          className="aspect-[3/4] w-full"
        />
        {offer.discount_percent != null && offer.discount_percent > 0 ? (
          <span className="absolute top-2 left-2 z-10">
            <DiscountBadge percent={offer.discount_percent} />
          </span>
        ) : null}
      </span>
      <span
        className={`mt-2 block truncate text-sm font-extrabold tracking-tight ${
          onForest ? "" : "text-ink"
        }`}
      >
        {offer.name}
      </span>
      {offer.discounted_price != null ? (
        <span className="mt-0.5 block text-sm font-extrabold text-accent tabular-nums">
          {formatEurFromCents(offer.discounted_price)}
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
    layout === "rail" ? "w-40 shrink-0 snap-start sm:w-48" : "block min-w-0";

  if (layout === "feature") {
    return (
      <Link
        href={`/dosje/${folder.id}`}
        className={`group grid overflow-hidden rounded-[1.75rem] bg-forest text-ivory sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] dark:bg-[#121816] dark:text-ink ${focus}`}
      >
        <span className="relative block min-h-56 sm:min-h-72">
          <ProductVisual
            fill
            eager
            name={coverName}
            imageUrl={folder.cover?.detail_url ?? folder.cover?.thumb_url}
            sizes="(max-width: 640px) 100vw, 520px"
          />
          <span className="absolute top-3 left-3 z-10 rounded-full bg-ivory px-2.5 py-1 text-[0.68rem] font-extrabold tracking-tight text-charcoal">
            Fletushkë
          </span>
        </span>
        <span className="flex min-w-0 flex-col justify-center gap-3 px-5 py-6 sm:px-8">
          {shop ? (
            <ShopLine name={shop} logoUrl={folder.business?.logo_url} forest />
          ) : null}
          <span className="line-clamp-3 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.05] font-extrabold tracking-[-0.04em]">
            {folder.title}
          </span>
          {folder.lead_discount_percent != null && folder.lead_discount_percent > 0 ? (
            <span>
              <DiscountBadge percent={folder.lead_discount_percent} />
            </span>
          ) : null}
        </span>
      </Link>
    );
  }

  return (
    <Link href={`/dosje/${folder.id}`} className={`${width} ${focus}`}>
      <span className="relative block overflow-hidden rounded-2xl ring-1 ring-accent/40">
        <ProductVisual
          name={coverName}
          imageUrl={folder.cover?.thumb_url}
          eager
          sizes={layout === "rail" ? "192px" : "(max-width: 640px) 100vw, 360px"}
          className="aspect-[3/4] w-full"
        />
        <span className="absolute top-2 left-2 z-10 rounded-full bg-ivory px-2 py-0.5 text-[0.65rem] font-extrabold tracking-tight text-charcoal">
          Fletushkë
        </span>
        {folder.lead_discount_percent != null && folder.lead_discount_percent > 0 ? (
          <span className="absolute top-2 right-2 z-10">
            <DiscountBadge percent={folder.lead_discount_percent} />
          </span>
        ) : null}
      </span>
      <span
        className={`mt-2 block truncate text-sm font-extrabold tracking-tight ${
          onForest ? "" : "text-ink"
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
    <span className="mt-1 flex min-w-0 items-center gap-1.5">
      <ShopLogo name={name} logoUrl={logoUrl} size="sm" />
      <span className={`truncate text-xs ${forest ? "text-ivory/70 dark:text-muted" : "text-muted"}`}>
        {name}
      </span>
    </span>
  );
}
