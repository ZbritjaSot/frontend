"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ExclusiveCard } from "@/features/public/ExclusiveCard";
import { Frame } from "@/features/public/Frame";
import { ExclusiveMark } from "@/features/public/exclusiveChrome";
import type { ExclusiveItem } from "@/features/offers/api";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";

/** Pause between automatic one-card advances. */
const INTERVAL_MS = 4000;
/** Match the CSS transition duration used on the track. */
const TRANSITION_MS = 550;

function trackCopies(count: number): number {
  if (count <= 1) {
    return 1;
  }
  if (count <= 4) {
    return 3;
  }
  return 2;
}

/**
 * Homepage exclusive rail — forest surface, original card rail layout,
 * auto-advancing one card at a time with a seamless loop.
 */
export function ExclusiveBand({
  items,
  title = EXCLUSIVE_LABEL,
}: {
  items: ExclusiveItem[];
  title?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return <ExclusiveRail items={items} title={title} />;
}

function ExclusiveRail({
  items,
  title,
}: {
  items: ExclusiveItem[];
  title: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const holdUntil = useRef(0);
  const stepRef = useRef(0);
  const drag = useRef<{
    pointerId: number;
    x: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const offsetRef = useRef(0);

  const [offset, setOffset] = useState(0);
  const [step, setStep] = useState(0);
  const [instant, setInstant] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragShift, setDragShift] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const count = items.length;
  const looping = count > 1 && !reduceMotion;
  const copies = trackCopies(count);
  const slides = Array.from({ length: copies }, () => items).flat();

  useLayoutEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) {
      return;
    }

    const measure = () => {
      const first = el.children[0] as HTMLElement | undefined;
      if (!first) {
        return;
      }
      const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap || "0") || 0;
      // offsetWidth matches layout / translateX; getBoundingClientRect can disagree under viewport scale.
      const next = first.offsetWidth + gap;
      stepRef.current = next;
      setStep((current) => (Math.abs(current - next) < 0.5 ? current : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [count, copies, reduceMotion]);

  useEffect(() => {
    if (!instant) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setInstant(false));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [instant, offset]);

  useEffect(() => {
    if (!looping || offset < count) {
      return;
    }
    const id = window.setTimeout(() => {
      setInstant(true);
      setOffset((current) => current - count);
    }, TRANSITION_MS);
    return () => window.clearTimeout(id);
  }, [offset, count, looping]);

  useEffect(() => {
    if (!looping) {
      return;
    }

    const id = window.setInterval(() => {
      if (
        hovering.current ||
        Date.now() < holdUntil.current ||
        drag.current ||
        stepRef.current <= 0
      ) {
        return;
      }
      setOffset((current) => current + 1);
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [looping, count]);

  function hold(ms = INTERVAL_MS) {
    const until = Date.now() + ms;
    if (until > holdUntil.current) {
      holdUntil.current = until;
    }
  }

  function snapToNearest(pixelShift: number) {
    if (step <= 0) {
      setDragShift(0);
      setDragging(false);
      return;
    }

    const delta = Math.round(pixelShift / step);
    let next = offsetRef.current - delta;
    while (next < 0) {
      next += count;
    }
    while (next >= count * 2) {
      next -= count;
    }

    setDragShift(0);
    setDragging(false);
    if (next !== offsetRef.current) {
      setOffset(next);
    }
    hold();
  }

  const shiftPx = dragging ? offset * -step + dragShift : offset * -step;
  const transition =
    instant || dragging || step === 0
      ? "none"
      : `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <section
      className="mt-8 bg-forest text-ivory sm:mt-10"
      onPointerEnter={() => {
        hovering.current = true;
      }}
      onPointerLeave={() => {
        hovering.current = false;
      }}
    >
      <Frame className="pt-10 pb-0 sm:pt-12">
        <div className="min-w-0 max-w-xl">
          <ExclusiveMark size="md" />
          <h2 className="m-0 mt-4 text-[clamp(2rem,4vw,2.85rem)] leading-[0.95] font-extrabold tracking-[-0.045em] text-ivory">
            {title}
          </h2>
          <p className="mt-3 mb-0 max-w-sm text-sm leading-relaxed text-ivory/60">
            Një përzgjedhje e vogël e zbritjeve që vlejnë vëmendjen.
          </p>
        </div>
      </Frame>

      {reduceMotion ? (
        <div
          className="flex snap-x snap-proximity gap-4 overflow-x-auto px-5 pt-8 pb-10 scroll-px-5 [scrollbar-width:none] sm:gap-5 sm:px-8 sm:pt-10 sm:pb-12 sm:scroll-px-8 [&::-webkit-scrollbar]:hidden"
          aria-label={title}
        >
          {items.map((item) => (
            <ExclusiveCard key={itemKey(item)} item={item} layout="rail" />
          ))}
        </div>
      ) : (
        <div
          ref={viewport}
          className={`overflow-hidden px-5 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-12 ${
            looping ? "cursor-grab active:cursor-grabbing" : ""
          }`}
          aria-label={title}
          onPointerDown={(event) => {
            if (!looping || !viewport.current) {
              return;
            }
            if (event.pointerType === "mouse" && event.button !== 0) {
              return;
            }
            suppressClick.current = false;
            drag.current = {
              pointerId: event.pointerId,
              x: event.clientX,
              moved: false,
            };
            setDragging(true);
            setDragShift(0);
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (!start || start.pointerId !== event.pointerId) {
              return;
            }
            const dx = event.clientX - start.x;
            if (!start.moved && Math.abs(dx) < 8) {
              return;
            }
            if (!start.moved) {
              start.moved = true;
              try {
                viewport.current?.setPointerCapture(event.pointerId);
              } catch {
                // Some environments reject capture mid-gesture.
              }
            }
            setDragShift(dx);
          }}
          onPointerUp={(event) => {
            const start = drag.current;
            if (!start || start.pointerId !== event.pointerId) {
              return;
            }
            if (viewport.current?.hasPointerCapture?.(event.pointerId)) {
              viewport.current.releasePointerCapture(event.pointerId);
            }
            const shift = start.moved ? event.clientX - start.x : 0;
            drag.current = null;
            if (start.moved) {
              suppressClick.current = true;
              snapToNearest(shift);
            } else {
              setDragging(false);
              setDragShift(0);
            }
          }}
          onPointerCancel={(event) => {
            const start = drag.current;
            if (!start || start.pointerId !== event.pointerId) {
              return;
            }
            if (viewport.current?.hasPointerCapture?.(event.pointerId)) {
              viewport.current.releasePointerCapture(event.pointerId);
            }
            drag.current = null;
            setDragging(false);
            setDragShift(0);
          }}
          onClickCapture={(event) => {
            if (!suppressClick.current) {
              return;
            }
            suppressClick.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}
          onFocusCapture={() => {
            hold();
          }}
        >
          <div
            ref={track}
            className="flex w-max gap-4 sm:gap-5"
            style={{
              transform: `translate3d(${shiftPx}px, 0, 0)`,
              transition,
            }}
          >
            {slides.map((item, index) => {
              const clone = index >= count;
              return (
                <ExclusiveCard
                  key={`${clone ? "clone" : "item"}-${itemKey(item)}-${index}`}
                  item={item}
                  layout="rail"
                  inertClone={clone}
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function itemKey(item: ExclusiveItem): string {
  return item.kind === "flyer" ? `flyer:${item.flyer.id}` : `offer:${item.offer.id}`;
}
