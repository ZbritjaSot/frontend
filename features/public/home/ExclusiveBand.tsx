import Link from "next/link";
import { Frame } from "@/features/public/Frame";
import { DiscountBadge } from "@/features/public/price";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import type { ExclusiveItem } from "@/features/offers/api";
import { formatEurFromCents } from "@/lib/format";
import { EXCLUSIVE_HREF, EXCLUSIVE_LABEL } from "@/lib/exclusive";

export function ExclusiveBand({
  items,
  title = "Kapeni tani.",
}: {
  items: ExclusiveItem[];
  title?: string;
}) {
  const shown = items.slice(0, 8);
  if (shown.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-6">
      <section className="overflow-hidden rounded-[1.75rem] bg-forest text-ivory dark:bg-[#121816] dark:text-ink">
        <div className="flex items-end justify-between gap-3 px-5 pt-5 sm:px-6">
          <div>
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.2em] text-accent uppercase">
              {EXCLUSIVE_LABEL}
            </p>
            <h2 className="m-0 mt-1 text-2xl leading-none font-extrabold tracking-[-0.04em] text-ivory sm:text-3xl dark:text-ink">
              {title}
            </h2>
          </div>
          <Link
            href={EXCLUSIVE_HREF}
            className="shrink-0 text-sm font-extrabold text-ivory underline-offset-4 hover:underline dark:text-ink"
          >
            Shiko të gjitha
          </Link>
        </div>
        <div
          className="flex snap-x snap-proximity gap-4 overflow-x-auto px-5 pt-4 pb-5 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
          aria-label={EXCLUSIVE_LABEL}
        >
          {shown.map((item) =>
            item.kind === "flyer" ? (
              <FlyerCard key={`flyer:${item.flyer.id}`} item={item} />
            ) : (
              <OfferCard key={`offer:${item.offer.id}`} item={item} />
            ),
          )}
        </div>
      </section>
    </Frame>
  );
}

function OfferCard({ item }: { item: Extract<ExclusiveItem, { kind: "offer" }> }) {
  const offer = item.offer;
  const shop = offer.business?.name;

  return (
    <Link href={`/offers/${offer.id}`} className="w-40 shrink-0 snap-start sm:w-48">
      <span className="relative block overflow-hidden rounded-2xl ring-1 ring-accent/50">
        <ProductVisual
          name={offer.name}
          imageUrl={offer.image?.thumb_url}
          eager
          sizes="192px"
          className="aspect-[3/4] w-full"
        />
        {offer.discount_percent != null && offer.discount_percent > 0 ? (
          <span className="absolute top-2 left-2 z-10">
            <DiscountBadge percent={offer.discount_percent} />
          </span>
        ) : null}
      </span>
      <span className="mt-2 block truncate text-sm font-extrabold tracking-tight">
        {offer.name}
      </span>
      {offer.discounted_price != null ? (
        <span className="mt-0.5 block text-sm font-extrabold text-accent tabular-nums">
          {formatEurFromCents(offer.discounted_price)}
        </span>
      ) : null}
      {shop ? <ShopLine name={shop} logoUrl={offer.business?.logo_url} /> : null}
    </Link>
  );
}

function FlyerCard({ item }: { item: Extract<ExclusiveItem, { kind: "flyer" }> }) {
  const folder = item.flyer;
  const shop = folder.business?.name;
  const coverName = folder.cover?.name ?? folder.title;

  return (
    <Link href={`/dosje/${folder.id}`} className="w-40 shrink-0 snap-start sm:w-48">
      <span className="relative block overflow-hidden rounded-2xl ring-1 ring-accent/50">
        <ProductVisual
          name={coverName}
          imageUrl={folder.cover?.thumb_url}
          eager
          sizes="192px"
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
      <span className="mt-2 block truncate text-sm font-extrabold tracking-tight">
        {folder.title}
      </span>
      {shop ? <ShopLine name={shop} logoUrl={folder.business?.logo_url} /> : null}
    </Link>
  );
}

function ShopLine({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <span className="mt-1 flex min-w-0 items-center gap-1.5">
      <ShopLogo name={name} logoUrl={logoUrl} size="sm" />
      <span className="truncate text-xs text-ivory/70 dark:text-muted">{name}</span>
    </span>
  );
}
