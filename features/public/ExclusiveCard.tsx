import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import {
  ExclusivePercent,
  exclusiveFocus,
  exclusiveMedia,
  exclusiveShell,
} from "@/features/public/exclusiveChrome";
import { PriceLine } from "@/features/public/price";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import type { ExclusiveItem } from "@/features/offers/api";
import { formatEurFromCents } from "@/lib/format";

/**
 * Exclusive card — photo + ivory brand panel.
 * No gradient, no drop shadow, no overlay stack.
 * Offers and flyers share one footprint.
 */
export function ExclusiveCard({
  item,
  layout,
  lead = false,
}: {
  item: ExclusiveItem;
  layout: "rail" | "tile" | "feature";
  lead?: boolean;
}) {
  if (layout === "feature") {
    return <FeatureCard item={item} />;
  }

  return <CollectionCard item={item} layout={layout} lead={lead} />;
}

function CollectionCard({
  item,
  layout,
  lead,
}: {
  item: ExclusiveItem;
  layout: "rail" | "tile";
  lead: boolean;
}) {
  const meta = cardMeta(item);
  const width =
    layout === "rail"
      ? lead
        ? "w-[16rem] shrink-0 snap-start sm:w-[18rem]"
        : "w-[14.5rem] shrink-0 snap-start sm:w-[16rem]"
      : "flex h-full min-w-0 w-full flex-col";

  return (
    <Link
      href={meta.href}
      draggable={layout === "rail" ? false : undefined}
      className={`group ${width} ${exclusiveFocus}`}
    >
      <span className={`${exclusiveShell.tile} ${layout === "tile" ? "h-full" : ""}`}>
        <span className={`relative ${exclusiveMedia}`}>
          <ProductVisual
            fill
            eager={layout === "rail"}
            wash="plain"
            name={meta.imageName}
            imageUrl={meta.thumbUrl}
            sizes={
              layout === "rail"
                ? lead
                  ? "288px"
                  : "256px"
                : "(max-width: 1024px) 50vw, 280px"
            }
          />
          <span className="absolute top-3 right-3 z-10">
            <FavoriteButton kind={meta.favoriteKind} id={meta.favoriteId} />
          </span>
        </span>

        <span className="flex flex-1 flex-col gap-2.5 px-3.5 pt-3.5 pb-4 sm:gap-3 sm:px-4 sm:pt-4 sm:pb-5">
          <BrandRow
            shop={meta.shop}
            logoUrl={meta.logoUrl}
            kindLabel={meta.kindLabel}
            compact
          />
          <span
            className={`line-clamp-2 font-extrabold tracking-[-0.035em] text-charcoal dark:text-ivory ${
              lead || layout === "tile"
                ? "text-[1.05rem] leading-snug sm:text-[1.15rem]"
                : "text-[0.98rem] leading-snug"
            }`}
          >
            {meta.title}
          </span>
          <OfferLine
            sale={meta.sale}
            percent={meta.percent}
            size={lead || layout === "tile" ? "md" : "sm"}
          />
        </span>
      </span>
    </Link>
  );
}

function FeatureCard({ item }: { item: ExclusiveItem }) {
  const meta = cardMeta(item);

  return (
    <Link
      href={meta.href}
      className={`group grid lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.9fr)] ${exclusiveShell.featured} ${exclusiveFocus}`}
    >
      <span className="relative aspect-[4/5] min-h-[17rem] sm:aspect-[5/4] sm:min-h-[20rem] lg:aspect-auto lg:min-h-[26rem]">
        <ProductVisual
          fill
          eager
          priority
          wash="plain"
          name={meta.imageName}
          imageUrl={meta.detailUrl ?? meta.thumbUrl}
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
        <span className="absolute top-4 right-4 z-10 lg:hidden">
          <FavoriteButton kind={meta.favoriteKind} id={meta.favoriteId} size="md" />
        </span>
      </span>

      <span className="relative flex flex-col justify-between gap-8 bg-ivory px-6 py-7 sm:gap-10 sm:px-9 sm:py-9 lg:px-10 lg:py-11 dark:bg-[#141a16]">
        <span className="absolute top-5 right-5 hidden lg:block">
          <FavoriteButton kind={meta.favoriteKind} id={meta.favoriteId} size="md" />
        </span>

        <span className="flex flex-col gap-5 sm:gap-6">
          <BrandRow
            shop={meta.shop}
            logoUrl={meta.logoUrl}
            kindLabel={meta.kindLabel}
          />
          <span className="line-clamp-4 max-w-md text-[clamp(1.75rem,3.4vw,2.85rem)] leading-[0.98] font-extrabold tracking-[-0.045em] text-charcoal dark:text-ivory">
            {meta.title}
          </span>
        </span>

        <span className="flex flex-col gap-3">
          {meta.sale != null ? (
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {meta.percent != null && meta.percent > 0 ? (
                <ExclusivePercent percent={meta.percent} className="text-xl sm:text-2xl" />
              ) : null}
              <PriceLine
                sale={meta.sale}
                original={meta.original ?? 0}
                size="xl"
                tone="default"
              />
            </span>
          ) : meta.percent != null && meta.percent > 0 ? (
            <ExclusivePercent percent={meta.percent} className="text-2xl sm:text-3xl" />
          ) : null}
          <span className="text-[0.68rem] font-bold tracking-[0.2em] text-forest/55 uppercase dark:text-ivory/45">
            Ekskluzive
          </span>
        </span>
      </span>
    </Link>
  );
}

function BrandRow({
  shop,
  logoUrl,
  kindLabel,
  compact = false,
}: {
  shop?: string;
  logoUrl?: string | null;
  kindLabel?: string;
  compact?: boolean;
}) {
  if (!shop && !kindLabel) {
    return null;
  }

  return (
    <span className={`flex min-w-0 items-center ${compact ? "gap-2" : "gap-2.5"}`}>
      {shop ? (
        <ShopLogo name={shop} logoUrl={logoUrl} size={compact ? "sm" : "md"} />
      ) : null}
      <span className="min-w-0 flex flex-col gap-0.5">
        {kindLabel ? (
          <span className="text-[0.62rem] font-bold tracking-[0.16em] text-forest/55 uppercase dark:text-accent/80">
            {kindLabel}
          </span>
        ) : null}
        {shop ? (
          <span
            className={`truncate font-bold tracking-tight text-charcoal dark:text-ivory ${
              compact ? "text-[0.78rem]" : "text-sm"
            }`}
          >
            {shop}
          </span>
        ) : null}
      </span>
    </span>
  );
}

function OfferLine({
  sale,
  percent,
  size,
}: {
  sale?: number | null;
  percent?: number | null;
  size: "sm" | "md";
}) {
  if (sale == null && (percent == null || percent <= 0)) {
    return <span className="block h-5" aria-hidden />;
  }

  return (
    <span className="mt-auto flex flex-wrap items-baseline gap-x-2">
      {percent != null && percent > 0 ? (
        <ExclusivePercent
          percent={percent}
          className={size === "md" ? "text-[0.95rem]" : "text-sm"}
        />
      ) : null}
      {sale != null ? (
        <span
          className={`font-extrabold text-charcoal tabular-nums dark:text-ivory ${
            size === "md" ? "text-base" : "text-[0.95rem]"
          }`}
        >
          {formatEurFromCents(sale)}
        </span>
      ) : null}
    </span>
  );
}

type CardMeta = {
  href: string;
  title: string;
  imageName: string;
  thumbUrl?: string | null;
  detailUrl?: string | null;
  shop?: string;
  logoUrl?: string | null;
  kindLabel?: string;
  sale?: number | null;
  original?: number | null;
  percent?: number | null;
  favoriteKind: "offer" | "flyer";
  favoriteId: string;
};

function cardMeta(item: ExclusiveItem): CardMeta {
  if (item.kind === "flyer") {
    const folder = item.flyer;
    return {
      href: `/dosje/${folder.id}`,
      title: folder.title,
      imageName: folder.cover?.name ?? folder.title,
      thumbUrl: folder.cover?.thumb_url,
      detailUrl: folder.cover?.detail_url,
      shop: folder.business?.name,
      logoUrl: folder.business?.logo_url,
      kindLabel: "Fletushkë",
      percent: folder.lead_discount_percent,
      favoriteKind: "flyer",
      favoriteId: folder.id,
    };
  }

  const offer = item.offer;
  return {
    href: `/offers/${offer.id}`,
    title: offer.name,
    imageName: offer.name,
    thumbUrl: offer.image?.thumb_url,
    detailUrl: offer.image?.detail_url,
    shop: offer.business?.name,
    logoUrl: offer.business?.logo_url,
    sale: offer.discounted_price,
    original: offer.original_price,
    percent: offer.discount_percent,
    favoriteKind: "offer",
    favoriteId: offer.id,
  };
}
