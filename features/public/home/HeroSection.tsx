"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { DiscountBadge, PriceLine } from "@/features/public/price";
import { Frame } from "@/features/public/Frame";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import { formatDateSq, formatDiscountPercent } from "@/lib/format";
import type { PublicOffer } from "@/types";

const SLIDE_MS = 5000;

function useSlideTick(enabled: boolean): number {
  return useSyncExternalStore(
    (notify) => {
      if (!enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return () => {};
      }
      const id = window.setInterval(notify, SLIDE_MS);
      return () => window.clearInterval(id);
    },
    () => Math.floor(Date.now() / SLIDE_MS),
    () => 0,
  );
}

export function HeroSection({ offers }: { offers: PublicOffer[] }) {
  const count = offers.length;
  const tick = useSlideTick(count > 1);
  const [shift, setShift] = useState(0);
  const [frozen, setFrozen] = useState<number | null>(null);
  const index = count === 0 ? 0 : (frozen ?? (tick + shift) % count);
  const hero = offers[index] ?? null;

  function show(next: number) {
    if (count === 0) {
      return;
    }
    const normalized = (next + count) % count;
    setShift((normalized - (tick % count) + count) % count);
    setFrozen(null);
  }

  return (
    <section
      className="bg-forest text-ivory dark:bg-[#121816] dark:text-ink"
      onMouseEnter={() => setFrozen(index)}
      onMouseLeave={() => setFrozen(null)}
    >
      <Frame className="py-8 sm:py-10">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div className="min-w-0">
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.2em] text-accent uppercase">
              Zbritje e fortë
            </p>
            <h1 className="m-0 mt-3 max-w-xl text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[0.94] font-extrabold tracking-[-0.045em] text-ivory dark:text-ink">
              Zbritjet e ditës.
            </h1>
            {hero ? (
              <DealCopy key={hero.id} offer={hero} />
            ) : (
              <p className="mt-4 mb-0 max-w-md text-base leading-relaxed text-ivory/75 dark:text-muted">
                Momentalisht nuk ka zbritje publike. Ofertat e skaduara hiqen vetë nga lista.
              </p>
            )}
          </div>
          {hero ? (
            <Link
              key={hero.id}
              href={`/offers/${hero.id}`}
              className="relative block overflow-hidden rounded-[1.75rem] ring-1 ring-white/10"
            >
              <ProductVisual
                name={hero.name}
                imageUrl={hero.image?.detail_url ?? hero.image?.thumb_url}
                eager
                priority
                sizes="(max-width: 1024px) 100vw, 640px"
                className="aspect-[4/3] w-full"
              />
              {hero.discount_percent != null && hero.discount_percent > 0 ? (
                <span className="absolute top-3 left-3 z-10">
                  <DiscountBadge percent={hero.discount_percent} />
                </span>
              ) : null}
            </Link>
          ) : null}
          {count > 1 ? (
            <div className="flex items-center gap-1 lg:col-span-2">
              {offers.map((offer, dot) => (
                <button
                  key={offer.id}
                  type="button"
                  aria-label={`Oferta ${dot + 1}`}
                  aria-current={dot === index ? "true" : undefined}
                  className="inline-flex h-6 min-w-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
                  onClick={() => show(dot)}
                >
                  <span
                    className={`block h-2.5 rounded-full ${
                      dot === index ? "w-8 bg-accent" : "w-2.5 bg-ivory/40 dark:bg-ink/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Frame>
    </section>
  );
}

function DealCopy({ offer }: { offer: PublicOffer }) {
  const shop = offer.business?.name;

  return (
    <div className="mt-6 max-w-md">
      {offer.discount_percent != null && offer.discount_percent > 0 ? (
        <p className="m-0 text-5xl leading-none font-extrabold tracking-[-0.05em] text-accent">
          {formatDiscountPercent(offer.discount_percent)}
        </p>
      ) : null}
      <p className="m-0 mt-3 line-clamp-2 text-2xl leading-tight font-extrabold tracking-[-0.03em]">
        {offer.name}
      </p>
      {shop ? (
        <span className="mt-3 flex min-w-0 items-center gap-2">
          <ShopLogo name={shop} logoUrl={offer.business?.logo_url} size="sm" />
          <span className="truncate text-sm font-semibold text-ivory/85 dark:text-ink">
            {shop}
          </span>
        </span>
      ) : null}
      {offer.discounted_price != null ? (
        <div className="mt-4">
          <PriceLine
            sale={offer.discounted_price}
            original={offer.original_price ?? 0}
            size="lg"
            tone="inverse"
          />
        </div>
      ) : null}
      <p className="mt-2 mb-0 text-sm text-ivory/70 dark:text-muted">
        Deri më {formatDateSq(offer.expires_at)}
      </p>
      <Link
        href={`/offers/${offer.id}`}
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-extrabold text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Hap ofertën
      </Link>
    </div>
  );
}
