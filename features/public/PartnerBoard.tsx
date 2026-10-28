"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { campaignWord, productWord } from "@/features/public/compose";
import { fetchPublicBusinesses } from "@/features/offers/api";
import { DiscountBadge, PriceLine } from "@/features/public/price";
import { StepRail, type RailNav } from "@/features/public/StepRail";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import { useInfiniteSentinel } from "@/lib/useInfiniteSentinel";
import type { PublicBusiness, PublicFolder, PublicOffer } from "@/types";

const PAGE_SIZE = 6;

type RailItem =
  | { kind: "flyer"; flyer: PublicFolder }
  | { kind: "offer"; offer: PublicOffer };

export function PartnerBoard({
  shops,
  lastPage,
  q,
  city,
}: {
  shops: PublicBusiness[];
  lastPage: number;
  q?: string;
  city?: string;
}) {
  const [items, setItems] = useState(shops);
  const [page, setPage] = useState(1);
  const [done, setDone] = useState(lastPage <= 1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || done) {
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    setFailed(false);
    const next = page + 1;
    try {
      const result = await fetchPublicBusinesses({
        q: q || undefined,
        city,
        page: next,
        perPage: PAGE_SIZE,
        rail: true,
      });
      setItems((current) => appendUnique(current, result.data));
      setPage(next);
      setDone(next >= (result.meta?.last_page ?? next));
    } catch {
      setFailed(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [city, done, page, q]);

  const sentinel = useInfiniteSentinel({
    onLoadMore: loadMore,
    enabled: !done && !failed && !loading,
  });

  return (
    <div className="mt-8">
      <div className="grid gap-6">
        {items.map((shop) => (
          <PartnerRow key={shop.id} shop={shop} />
        ))}
      </div>
      <div ref={sentinel} className="h-8" />
      {loading ? (
        <p className="m-0 text-center text-sm font-semibold text-muted">Duke ngarkuar…</p>
      ) : null}
      {failed ? (
        <p className="m-0 text-center">
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent text-sm font-semibold text-ink underline"
            onClick={() => {
              void loadMore();
            }}
          >
            Provo përsëri
          </button>
        </p>
      ) : null}
    </div>
  );
}

function PartnerRow({ shop }: { shop: PublicBusiness }) {
  const place = shop.city ?? shop.village;
  const branches = shop.locations_count ?? 1;
  const flyers = shop.flyers_count ?? 0;
  const offers = shop.offers_count ?? 0;
  const branchLabel = branches === 1 ? "1 lokacion" : `${branches} lokacione`;
  const rail: RailItem[] = [
    ...(shop.flyers ?? []).map((flyer) => ({ kind: "flyer" as const, flyer })),
    ...(shop.offers ?? []).map((offer) => ({ kind: "offer" as const, offer })),
  ];
  const actions = useRef({ prev: () => {}, next: () => {} });
  const [nav, setNav] = useState({ atStart: true, atEnd: true, canScroll: false });
  const onNav = useCallback((state: RailNav) => {
    actions.current.prev = state.prev;
    actions.current.next = state.next;
    setNav((current) =>
      current.atStart === state.atStart &&
      current.atEnd === state.atEnd &&
      current.canScroll === state.canScroll
        ? current
        : { atStart: state.atStart, atEnd: state.atEnd, canScroll: state.canScroll },
    );
  }, []);

  return (
    <article className="min-w-0 border-b border-line pb-5">
      <header className="mb-3 flex min-w-0 items-center gap-3">
        <Link
          href={`/biznese/${shop.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <ShopLogo name={shop.name} logoUrl={shop.logo_url} size="md" />
          <span className="min-w-0">
            <span className="block truncate text-lg leading-tight font-extrabold tracking-tight">
              {shop.name}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted">
              {[place, branchLabel].filter(Boolean).join(" · ")}
              {` · ${flyers} ${campaignWord(flyers)} · ${offers} ${productWord(offers)}`}
            </span>
          </span>
        </Link>
        {rail.length > 0 ? (
          <div className="flex shrink-0 gap-1.5">
            <RailButton
              label="Më parë"
              direction="left"
              disabled={!nav.canScroll || nav.atStart}
              onClick={() => actions.current.prev()}
            />
            <RailButton
              label="Tjetra"
              direction="right"
              disabled={!nav.canScroll || nav.atEnd}
              onClick={() => actions.current.next()}
            />
          </div>
        ) : null}
      </header>
      {rail.length > 0 ? (
        <StepRail
          items={rail}
          autoplay={false}
          onNav={onNav}
          ariaLabel={`Ofertat e ${shop.name}`}
          getKey={(item) => (item.kind === "flyer" ? `flyer:${item.flyer.id}` : `offer:${item.offer.id}`)}
          viewportClassName="overflow-hidden"
          renderItem={(item, clone) =>
            item.kind === "flyer" ? (
              <FlyerSlide flyer={item.flyer} inert={clone} />
            ) : (
              <OfferSlide offer={item.offer} inert={clone} />
            )
          }
        />
      ) : null}
    </article>
  );
}

function RailButton({
  label,
  direction,
  disabled,
  onClick,
}: {
  label: string;
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-line bg-elevated text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-35 dark:border-white/10 dark:bg-[#1a2420]"
    >
      <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true" fill="none">
        <path
          d={direction === "left" ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

const slideWidth = "block w-[9.5rem] shrink-0 sm:w-[11rem]";

function FlyerSlide({ flyer, inert }: { flyer: PublicFolder; inert: boolean }) {
  const percent = flyer.lead_discount_percent ?? 0;
  const coverName = flyer.cover?.name ?? flyer.title;

  return (
    <Link
      href={`/dosje/${flyer.id}`}
      draggable={false}
      tabIndex={inert ? -1 : undefined}
      aria-hidden={inert || undefined}
      className={`${slideWidth} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      <span className="flex flex-col overflow-hidden rounded-xl border border-line bg-elevated dark:border-white/10 dark:bg-[#1a2420]">
        <span className="relative aspect-[5/4] overflow-hidden bg-[#1a2420]">
          <ProductVisual
            fill
            eager
            wash="plain"
            name={coverName}
            imageUrl={flyer.cover?.thumb_url}
            sizes="176px"
          />
          {percent > 0 ? <DiscountBadge percent={percent} size="sm" /> : null}
          <span className="absolute top-2 right-2 z-10">
            <FavoriteButton kind="flyer" id={flyer.id} />
          </span>
        </span>
        <span className="grid gap-0.5 px-2.5 py-2">
          <span className="text-[0.6rem] font-bold tracking-[0.14em] text-muted uppercase">
            Fletushkë
          </span>
          <span className="truncate text-sm font-extrabold tracking-tight">{flyer.title}</span>
        </span>
      </span>
    </Link>
  );
}

function OfferSlide({ offer, inert }: { offer: PublicOffer; inert: boolean }) {
  return (
    <Link
      href={`/offers/${offer.id}`}
      draggable={false}
      tabIndex={inert ? -1 : undefined}
      aria-hidden={inert || undefined}
      className={`${slideWidth} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      <span className="flex flex-col overflow-hidden rounded-xl border border-line bg-elevated dark:border-white/10 dark:bg-[#1a2420]">
        <span className="relative aspect-[5/4] overflow-hidden bg-[#1a2420]">
          <ProductVisual
            fill
            eager
            wash="plain"
            name={offer.name}
            imageUrl={offer.image?.thumb_url}
            sizes="176px"
          />
          {offer.discount_percent != null && offer.discount_percent > 0 ? (
            <DiscountBadge percent={offer.discount_percent} size="sm" />
          ) : null}
          <span className="absolute top-2 right-2 z-10">
            <FavoriteButton kind="offer" id={offer.id} />
          </span>
        </span>
        <span className="grid gap-0.5 px-2.5 py-2">
          <span className="truncate text-sm font-extrabold tracking-tight">{offer.name}</span>
          {offer.discounted_price != null ? (
            <PriceLine
              sale={offer.discounted_price}
              original={offer.original_price ?? 0}
              size="sm"
            />
          ) : (
            <span className="block h-5" />
          )}
        </span>
      </span>
    </Link>
  );
}

function appendUnique(current: PublicBusiness[], next: PublicBusiness[]): PublicBusiness[] {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...next.filter((item) => !seen.has(item.id))];
}
