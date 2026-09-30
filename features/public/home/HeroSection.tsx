"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DiscountBadge, PriceLine } from "@/features/public/price";
import { Frame } from "@/features/public/Frame";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import { formatDateSq } from "@/lib/format";
import type { PublicOffer } from "@/types";

const SLIDE_MS = 5000;

export function HeroSection({ offers }: { offers: PublicOffer[] }) {
  const count = offers.length;
  const scroller = useRef<HTMLDivElement>(null);
  const holdUntil = useRef(0);
  const hovering = useRef(false);
  const programmatic = useRef(false);
  const drag = useRef<{ x: number; y: number; left: number; axis: "x" | "y" | null; index: number } | null>(null);
  const suppressClick = useRef(false);
  const [index, setIndex] = useState(0);
  const hero = offers[index] ?? null;

  useEffect(() => {
    if (count < 2) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      if (hovering.current || Date.now() < holdUntil.current) {
        return;
      }
      const el = scroller.current;
      if (!el || el.clientWidth === 0) {
        return;
      }
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % count;
      programmatic.current = true;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      setIndex(next);
      window.setTimeout(() => {
        programmatic.current = false;
      }, 700);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [count]);

  function hold(ms = SLIDE_MS) {
    const until = Date.now() + ms;
    if (until > holdUntil.current) {
      holdUntil.current = until;
    }
  }

  function release() {
    holdUntil.current = Date.now() + SLIDE_MS;
  }

  function syncFromScroll() {
    const el = scroller.current;
    if (!el || el.clientWidth === 0 || programmatic.current || drag.current) {
      return;
    }
    const next = Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / el.clientWidth)));
    setIndex((current) => (current === next ? current : next));
    hold();
  }

  function show(next: number) {
    const el = scroller.current;
    if (!el || count === 0) {
      return;
    }
    const normalized = (next + count) % count;
    hold();
    programmatic.current = true;
    el.scrollTo({
      left: normalized * el.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    setIndex(normalized);
    window.setTimeout(() => {
      programmatic.current = false;
    }, 700);
  }

  return (
    <section
      className="overflow-x-clip bg-forest text-ivory"
      onMouseEnter={() => {
        hovering.current = true;
      }}
      onMouseLeave={() => {
        hovering.current = false;
      }}
    >
      <Frame className="py-8 sm:py-10">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div className="min-w-0">
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.2em] text-accent uppercase">
              Zbritje e fortë
            </p>
            <h1 className="m-0 mt-3 max-w-xl text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[0.94] font-extrabold tracking-[-0.045em] text-ivory">
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
          {count > 0 ? (
            <div
              ref={scroller}
              className="flex aspect-[4/3] w-full cursor-grab touch-pan-y overflow-x-hidden overflow-y-hidden rounded-[1.75rem] ring-1 ring-white/10 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
              onScroll={syncFromScroll}
              onPointerDown={(event) => {
                if (!scroller.current || (event.pointerType === "mouse" && event.button !== 0)) {
                  return;
                }
                suppressClick.current = false;
                hold(60_000);
                const width = scroller.current.clientWidth || 1;
                const startIndex = Math.round(scroller.current.scrollLeft / width);
                drag.current = {
                  x: event.clientX,
                  y: event.clientY,
                  left: startIndex * width,
                  axis: null,
                  index: startIndex,
                };
                scroller.current.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                const start = drag.current;
                const el = scroller.current;
                if (!start || !el) {
                  return;
                }
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                if (start.axis === null) {
                  if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
                    return;
                  }
                  start.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
                }
                if (start.axis === "x") {
                  const limited = Math.max(-el.clientWidth, Math.min(el.clientWidth, dx));
                  el.scrollLeft = start.left - limited;
                }
              }}
              onPointerUp={(event) => {
                const start = drag.current;
                drag.current = null;
                release();
                if (!start || start.axis !== "x" || !scroller.current || scroller.current.clientWidth === 0) {
                  return;
                }
                const dx = event.clientX - start.x;
                if (Math.abs(dx) < 40) {
                  show(start.index);
                  return;
                }
                suppressClick.current = true;
                show(start.index + (dx < 0 ? 1 : -1));
              }}
              onPointerCancel={() => {
                drag.current = null;
                release();
              }}
              onClickCapture={(event) => {
                if (!suppressClick.current) {
                  return;
                }
                suppressClick.current = false;
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              {offers.map((offer) => (
                <Link
                  key={offer.id}
                  href={`/offers/${offer.id}`}
                  draggable={false}
                  className="relative block w-full shrink-0"
                >
                  <ProductVisual
                    name={offer.name}
                    imageUrl={offer.image?.detail_url ?? offer.image?.thumb_url}
                    eager
                    priority={offer.id === hero?.id}
                    sizes="(max-width: 1024px) 100vw, 640px"
                    className="aspect-[4/3] w-full"
                  />
                  {offer.discount_percent != null && offer.discount_percent > 0 ? (
                    <span className="absolute top-3 left-3 z-10">
                      <DiscountBadge percent={offer.discount_percent} />
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : null}
          {count > 1 ? (
            <div className="flex items-center gap-1 lg:col-span-2">
              {offers.map((offer, dot) => (
                <button
                  key={offer.id}
                  type="button"
                  aria-label={`Oferta ${dot + 1}`}
                  aria-current={dot === index ? "true" : undefined}
                  className="inline-flex h-11 min-w-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
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
      {offer.discounted_price != null ? (
        <PriceLine
          sale={offer.discounted_price}
          original={offer.original_price ?? 0}
          size="xl"
          tone="hero"
        />
      ) : null}
      <Link
        href={`/offers/${offer.id}`}
        className="mt-3 line-clamp-2 block text-2xl leading-tight font-extrabold tracking-[-0.03em] text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {offer.name}
      </Link>
      {shop ? (
        <span className="mt-3 flex min-w-0 items-center gap-2">
          <ShopLogo name={shop} logoUrl={offer.business?.logo_url} size="sm" />
          <span className="truncate text-sm font-semibold text-ivory/85">
            {shop}
          </span>
        </span>
      ) : null}
      <p className="mt-2 mb-0 text-sm text-ivory/70 dark:text-muted">
        Deri më {formatDateSq(offer.expires_at)}
      </p>
    </div>
  );
}
