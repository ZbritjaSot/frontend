"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  /** Tooltip text. Empty/false renders `children` untouched. */
  content: ReactNode;
  /** Single trigger element (button, link, badge). May be disabled. */
  children: ReactElement<{ "aria-label"?: string; "aria-describedby"?: string }>;
  /** Classes for the inline-flex wrapper (use for layout classes such as `self-center`). */
  className?: string;
};

const SHOW_DELAY_MS = 150;
const HIDE_DELAY_MS = 100;
const GAP = 6;
const MARGIN = 8;

function isEmpty(content: ReactNode) {
  return content === null || content === undefined || content === false || content === "";
}

function isFocusVisible(target: EventTarget) {
  try {
    return (target as Element).matches(":focus-visible");
  } catch {
    return true;
  }
}

/**
 * Accessible tooltip. Shows on hover (short delay) and keyboard focus, hides on
 * mouseleave/blur/Escape, stays open while the bubble itself is hovered (WCAG 1.4.13).
 * Hover/focus listeners live on an inline-flex wrapper so disabled buttons work too.
 * The trigger keeps its own aria-label; aria-describedby is only added when the
 * tooltip text differs from it. Not shown for touch pointers.
 */
export function Tooltip({ content, children, className }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasContent = !isEmpty(content);

  const clearTimers = useCallback(() => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    showTimer.current = null;
    hideTimer.current = null;
  }, []);

  const show = useCallback(
    (delay: number) => {
      clearTimers();
      if (delay <= 0) {
        setOpen(true);
        return;
      }
      showTimer.current = setTimeout(() => setOpen(true), delay);
    },
    [clearTimers],
  );

  const hide = useCallback(
    (delay: number) => {
      clearTimers();
      if (delay <= 0) {
        setOpen(false);
        return;
      }
      hideTimer.current = setTimeout(() => setOpen(false), delay);
    },
    [clearTimers],
  );

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clearTimers();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, clearTimers]);

  // Position from the trigger's rect: above by default, flip below, clamp horizontally.
  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const trigger = wrapperRef.current;
      const bubble = bubbleRef.current;
      if (!trigger || !bubble) return;
      const rect = trigger.getBoundingClientRect();
      const width = bubble.offsetWidth;
      const height = bubble.offsetHeight;
      const vw = document.documentElement.clientWidth;
      const above = rect.top - height - GAP >= MARGIN;
      const top = above ? rect.top - height - GAP : rect.bottom + GAP;
      const left = Math.max(
        MARGIN,
        Math.min(rect.left + rect.width / 2 - width / 2, vw - width - MARGIN),
      );
      bubble.style.top = `${top}px`;
      bubble.style.left = `${left}px`;
      // Bridge the gap so the pointer can travel from trigger to bubble.
      bubble.style.paddingTop = above ? "0px" : `${GAP}px`;
      bubble.style.paddingBottom = above ? `${GAP}px` : "0px";
      bubble.style.visibility = "visible";
    }
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  if (!hasContent) return children;

  const childLabel = children.props["aria-label"];
  const redundant = typeof content === "string" && content === childLabel;
  const trigger =
    open && !redundant && isValidElement(children)
      ? cloneElement(children, {
          "aria-describedby": [children.props["aria-describedby"], id].filter(Boolean).join(" "),
        })
      : children;

  return (
    <span
      ref={wrapperRef}
      className={["inline-flex", className].filter(Boolean).join(" ")}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        show(SHOW_DELAY_MS);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch") return;
        hide(HIDE_DELAY_MS);
      }}
      onFocus={(event) => {
        if (isFocusVisible(event.target)) show(0);
      }}
      onBlur={() => hide(0)}
    >
      {trigger}
      {open
        ? createPortal(
            <div
              ref={bubbleRef}
              id={id}
              role="tooltip"
              style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
              className="z-[220] max-w-[min(18rem,calc(100vw-1rem))]"
              onPointerEnter={clearTimers}
              onPointerLeave={() => hide(HIDE_DELAY_MS)}
            >
              <div className="rounded-md bg-ink px-2.5 py-1.5 text-xs leading-snug font-medium text-canvas shadow-[0_8px_24px_var(--color-shadow)]">
                {content}
              </div>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
