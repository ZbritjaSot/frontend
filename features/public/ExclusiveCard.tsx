import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import {
  exclusiveFocus,
  exclusiveMedia,
  exclusiveShell,
} from "@/features/public/exclusiveChrome";
import { DiscountBadge } from "@/features/public/price";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import type { ExclusiveItem } from "@/features/offers/api";
import { formatEurFromCents } from "@/lib/format";

/**
 * Exclusive card — photo + ivory brand panel.
 * No gradient, no drop shadow, no overlay stack.
 */
export function ExclusiveCard({
  item,
  layout,
  inertClone = false,
}: {
  item: ExclusiveItem;
  layout: "rail" | "tile";
  /** Decorative loop clone — hidden from assistive tech / tab order. */
  inertClone?: boolean;
}) {
  const meta = cardMeta(item);
  const width =
    layout === "rail"
      ? "block w-[14.5rem] shrink-0 snap-start sm:w-[16rem]"
      : "flex h-full min-w-0 w-full flex-col";

  return (
    <Link
      href={meta.href}
      draggable={layout === "rail" ? false : undefined}
      tabIndex={inertClone ? -1 : undefined}
      aria-hidden={inertClone || undefined}
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
            sizes={layout === "rail" ? "256px" : "(max-width: 1024px) 50vw, 280px"}
          />
          {meta.percent != null && meta.percent > 0 ? (
            <DiscountBadge percent={meta.percent} />
          ) : null}
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
              layout === "tile"
                ? "text-[1.05rem] leading-snug sm:text-[1.15rem]"
                : "text-[0.98rem] leading-snug"
            }`}
          >
            {meta.title}
          </span>
          <OfferLine
            sale={meta.sale}
            original={meta.original}
            size={layout === "tile" ? "md" : "sm"}
          />
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
  original,
  size,
}: {
  sale?: number | null;
  original?: number | null;
  size: "sm" | "md";
}) {
  if (sale == null) {
    return <span className="block h-5" aria-hidden />;
  }

  const showWas = original != null && original > sale;

  return (
    <span className="mt-auto flex flex-wrap items-baseline gap-x-2">
      <span
        className={`sale-price-outline font-extrabold text-accent tabular-nums ${
          size === "md" ? "text-base" : "text-[0.95rem]"
        }`}
      >
        {formatEurFromCents(sale)}
      </span>
      {showWas ? (
        <span className="text-sm text-was line-through tabular-nums">
          {formatEurFromCents(original)}
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
    shop: offer.business?.name,
    logoUrl: offer.business?.logo_url,
    sale: offer.discounted_price,
    original: offer.original_price,
    percent: offer.discount_percent,
    favoriteKind: "offer",
    favoriteId: offer.id,
  };
}
