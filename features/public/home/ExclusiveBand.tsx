"use client";

import Link from "next/link";
import { useRef } from "react";
import { ExclusiveCard } from "@/features/public/ExclusiveCard";
import { Frame } from "@/features/public/Frame";
import { ExclusiveMark } from "@/features/public/exclusiveChrome";
import type { ExclusiveItem } from "@/features/offers/api";
import { EXCLUSIVE_HREF, EXCLUSIVE_LABEL } from "@/lib/exclusive";

/**
 * Homepage Exclusive rail — solid forest surface, existing Swiper/drag,
 * new Exclusive cards. No gradient treatment.
 */
export function ExclusiveBand({
  items,
  title = EXCLUSIVE_LABEL,
}: {
  items: ExclusiveItem[];
  title?: string;
}) {
  const shown = items.slice(0, 8);
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  if (shown.length === 0) {
    return null;
  }

  const [lead, ...rest] = shown;

  return (
    <section className="mt-8 bg-forest text-ivory sm:mt-10">
      <Frame className="pt-10 pb-0 sm:pt-12">
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0 max-w-xl">
            <ExclusiveMark size="md" />
            <h2 className="m-0 mt-4 text-[clamp(2rem,4vw,2.85rem)] leading-[0.95] font-extrabold tracking-[-0.045em] text-ivory">
              {title}
            </h2>
            <p className="mt-3 mb-0 max-w-sm text-sm leading-relaxed text-ivory/60">
              Një përzgjedhje e vogël e zbritjeve që vlejnë vëmendjen.
            </p>
          </div>
          <Link
            href={EXCLUSIVE_HREF}
            className="mb-1 shrink-0 text-sm font-extrabold tracking-tight text-ivory/75 underline-offset-4 transition-colors hover:text-ivory hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Shiko të gjitha
          </Link>
        </div>
      </Frame>

      <div
        ref={rail}
        className="flex cursor-grab snap-x snap-proximity gap-4 overflow-x-auto px-5 pt-8 pb-10 scroll-px-5 active:cursor-grabbing [scrollbar-width:none] sm:gap-5 sm:px-8 sm:pt-10 sm:pb-12 sm:scroll-px-8 [&::-webkit-scrollbar]:hidden"
        aria-label={EXCLUSIVE_LABEL}
        onPointerDown={(event) => {
          if (!rail.current || (event.pointerType === "mouse" && event.button !== 0)) {
            return;
          }
          suppressClick.current = false;
          drag.current = {
            x: event.clientX,
            left: rail.current.scrollLeft,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          const el = rail.current;
          if (!start || !el) {
            return;
          }
          const dx = event.clientX - start.x;
          if (!start.moved && Math.abs(dx) < 8) {
            return;
          }
          if (!start.moved) {
            start.moved = true;
            try {
              el.setPointerCapture(event.pointerId);
            } catch {
              // Some environments reject capture mid-gesture.
            }
          }
          el.scrollLeft = start.left - dx;
        }}
        onPointerUp={(event) => {
          const start = drag.current;
          const el = rail.current;
          if (el?.hasPointerCapture?.(event.pointerId)) {
            el.releasePointerCapture(event.pointerId);
          }
          drag.current = null;
          if (start?.moved) {
            suppressClick.current = true;
          }
        }}
        onPointerCancel={(event) => {
          const el = rail.current;
          if (el?.hasPointerCapture?.(event.pointerId)) {
            el.releasePointerCapture(event.pointerId);
          }
          drag.current = null;
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
        {lead ? (
          <ExclusiveCard key={itemKey(lead)} item={lead} layout="rail" lead />
        ) : null}
        {rest.map((item) => (
          <ExclusiveCard key={itemKey(item)} item={item} layout="rail" />
        ))}
      </div>
    </section>
  );
}

function itemKey(item: ExclusiveItem): string {
  return item.kind === "flyer" ? `flyer:${item.flyer.id}` : `offer:${item.offer.id}`;
}
