import Link from "next/link";
import { campaignWord } from "@/features/public/compose";
import { Frame, SeeAll } from "@/features/public/Frame";
import { kicker } from "@/features/public/tone";
import { ShopLogo } from "@/features/public/visuals";
import type { PublicBusiness } from "@/types";

export function ShopDirectory({ shops }: { shops: PublicBusiness[] }) {
  if (shops.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-10 pb-14 sm:pt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={kicker}>Dyqane</p>
          <h2 className="m-0 mt-1 text-2xl leading-none font-extrabold tracking-[-0.04em] sm:text-3xl">
            Dyqanet
          </h2>
          <p className="mt-2 mb-0 max-w-xl text-sm leading-relaxed text-muted">
            Një përzgjedhje e dyqaneve me fletushka aktive. Lista e plotë është te Dyqanet.
          </p>
        </div>
        <SeeAll href="/biznese">Shiko të gjitha</SeeAll>
      </div>
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        {shops.map((shop) => {
          const place = shop.city ?? shop.village;
          const flyers = shop.flyers_count ?? 0;
          return (
            <li key={shop.id}>
              <Link
                href={`/biznese/${shop.id}`}
                className="flex min-h-12 min-w-0 items-center gap-3 border-b border-line px-1 py-3 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:transition-colors"
              >
                <ShopLogo name={shop.name} logoUrl={shop.logo_url} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-base font-extrabold tracking-tight">
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
        })}
      </ul>
    </Frame>
  );
}
