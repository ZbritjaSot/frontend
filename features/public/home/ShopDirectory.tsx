import Link from "next/link";
import { campaignWord, locationLabel } from "@/features/public/compose";
import { Frame, SeeAll } from "@/features/public/Frame";
import { kicker } from "@/features/public/tone";
import { ShopLogo } from "@/features/public/visuals";
import type { PublicBusiness } from "@/types";

/** Fixed card width so one shop matches a shop in a multi-shop row. */
const SHOP_CARD =
  "flex min-h-12 w-[17.5rem] shrink-0 items-center gap-3 rounded-xl px-2 py-3 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:transition-colors";

function shopCopies(count: number): number {
  if (count <= 1) {
    return 1;
  }
  if (count <= 2) {
    return 4;
  }
  if (count <= 4) {
    return 3;
  }
  return 2;
}

export function ShopDirectory({
  shops,
  title = "Partnerët",
}: {
  shops: PublicBusiness[];
  title?: string;
}) {
  if (shops.length === 0) {
    return null;
  }

  const copies = shopCopies(shops.length);
  const sliding = copies > 1;

  return (
    <Frame className="pt-10 pb-14 sm:pt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={kicker}>Partnerë</p>
          <h2 className="m-0 mt-1 text-2xl leading-none font-extrabold tracking-[-0.04em] sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 mb-0 max-w-xl text-sm leading-relaxed text-muted">
            Një përzgjedhje e partnerëve me fletushka aktive. Lista e plotë është te
            Partnerët.
          </p>
        </div>
        <SeeAll href="/biznese">Shiko të gjitha</SeeAll>
      </div>
      <div
        className={`group -mx-1 overflow-hidden ${sliding ? "motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none] motion-reduce:[&::-webkit-scrollbar]:hidden" : ""}`}
      >
        <ul
          className={`m-0 flex w-max list-none gap-2 p-0 ${
            sliding
              ? "motion-safe:animate-[shop-marquee_var(--shop-marquee-duration)_linear_infinite] motion-safe:group-hover:[animation-play-state:paused] motion-safe:focus-within:[animation-play-state:paused]"
              : ""
          }`}
          style={
            sliding
              ? {
                  ["--shop-copies" as string]: String(copies),
                  ["--shop-marquee-duration" as string]: `${Math.max(shops.length * 7, 20)}s`,
                }
              : undefined
          }
          aria-label={title}
        >
          {Array.from({ length: copies }, (_, copy) =>
            shops.map((shop) => (
              <ShopSlide
                key={`${copy}-${shop.id}`}
                shop={shop}
                clone={copy > 0}
              />
            )),
          )}
        </ul>
      </div>
    </Frame>
  );
}

function ShopSlide({
  shop,
  clone,
}: {
  shop: PublicBusiness;
  clone: boolean;
}) {
  const place = locationLabel(shop.locations_count, shop.city ?? shop.village);
  const flyers = shop.flyers_count ?? 0;

  return (
    <li {...(clone ? { "data-shop-clone": "", "aria-hidden": true } : {})}>
      <Link href={`/biznese/${shop.id}`} className={SHOP_CARD} tabIndex={clone ? -1 : undefined}>
        <ShopLogo name={shop.name} logoUrl={shop.logo_url} size="md" />
        <span className="min-w-0">
          <span className="block truncate text-lg font-extrabold tracking-tight sm:text-xl">
            {shop.name}
          </span>
          <span className="block truncate text-xs text-muted">
            {place ? `${place} · ` : ""}
            {flyers} {campaignWord(flyers)}
          </span>
        </span>
      </Link>
    </li>
  );
}
