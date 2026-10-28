"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

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

export type RailNav = {
  prev: () => void;
  next: () => void;
  atStart: boolean;
  atEnd: boolean;
  canScroll: boolean;
};

/**
 * One-card step carousel. With autoplay, the track advances by a single item,
 * then resets on a duplicated copy so the loop has no empty gap. Without
 * autoplay it stays on the first card until moved, and stops at the last one.
 */
export function StepRail<T>({
  items,
  getKey,
  renderItem,
  ariaLabel,
  viewportClassName = "overflow-hidden",
  autoplay = true,
  onNav,
}: {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, clone: boolean) => ReactNode;
  ariaLabel: string;
  viewportClassName?: string;
  /** Automatic one-card advance. Off for a manual previous/next rail. */
  autoplay?: boolean;
  onNav?: (nav: RailNav) => void;
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
  const [room, setRoom] = useState(0);

  const count = items.length;
  const manual = !autoplay;
  const looping = count > 1 && !reduceMotion && !manual;
  const copies = looping ? trackCopies(count) : 1;
  const slides = Array.from({ length: copies }, () => items).flat();
  const maxOffset = step > 0 ? Math.max(0, Math.ceil(room / step - 0.001)) : 0;
  const maxRef = useRef(0);

  useLayoutEffect(() => {
    offsetRef.current = offset;
    maxRef.current = maxOffset;
  }, [offset, maxOffset]);

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
      const next = first.offsetWidth + gap;
      stepRef.current = next;
      setStep((current) => (Math.abs(current - next) < 0.5 ? current : next));
      const viewWidth = viewport.current?.clientWidth ?? 0;
      const nextRoom = Math.max(0, el.scrollWidth - viewWidth);
      setRoom((current) => (Math.abs(current - nextRoom) < 0.5 ? current : nextRoom));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (viewport.current) {
      observer.observe(viewport.current);
    }
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

  useEffect(() => {
    if (!onNav) {
      return;
    }
    const nudge = (direction: number) => {
      if (reduceMotion) {
        const el = viewport.current;
        if (!el) {
          return;
        }
        const first = el.firstElementChild as HTMLElement | null;
        const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
        const amount = (first?.offsetWidth || stepRef.current || 180) + gap;
        el.scrollBy({ left: direction * amount, behavior: "smooth" });
        return;
      }
      setOffset((current) => Math.min(maxRef.current, Math.max(0, current + direction)));
    };
    onNav({
      prev: () => nudge(-1),
      next: () => nudge(1),
      atStart: reduceMotion ? false : offset <= 0,
      atEnd: reduceMotion ? false : maxOffset <= 0 || offset >= maxOffset,
      canScroll: reduceMotion ? count > 1 : maxOffset > 0,
    });
  }, [onNav, offset, maxOffset, reduceMotion, count]);

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
    if (!looping) {
      next = Math.min(maxRef.current, Math.max(0, next));
    } else {
      while (next < 0) {
        next += count;
      }
      while (next >= count * 2) {
        next -= count;
      }
    }

    setDragShift(0);
    setDragging(false);
    if (next !== offsetRef.current) {
      setOffset(next);
    }
    hold();
  }

  if (count === 0) {
    return null;
  }

  if (reduceMotion) {
    return (
      <div
        ref={viewport}
        className={`flex snap-x snap-proximity gap-4 overflow-x-auto [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden ${viewportClassName}`}
        aria-label={ariaLabel}
      >
        {items.map((item) => (
          <div key={getKey(item)} className="snap-start">
            {renderItem(item, false)}
          </div>
        ))}
      </div>
    );
  }

  const travel = looping ? offset * step : Math.min(offset * step, room);
  const shiftPx = dragging ? -travel + dragShift : -travel;
  const movable = looping || (manual && maxOffset > 0);
  const transition =
    instant || dragging || step === 0
      ? "none"
      : `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <div
      ref={viewport}
      className={`${viewportClassName} ${movable ? "cursor-grab active:cursor-grabbing" : ""}`}
      aria-label={ariaLabel}
      onPointerEnter={() => {
        hovering.current = true;
      }}
      onPointerLeave={() => {
        hovering.current = false;
      }}
      onPointerDown={(event) => {
        if (!movable || !viewport.current) {
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
            <div key={`${clone ? "clone" : "item"}-${getKey(item)}-${index}`} className="shrink-0">
              {renderItem(item, clone)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
