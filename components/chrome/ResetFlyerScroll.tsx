"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { isFlyerCataloguePath, shouldResetFlyerScroll } from "@/lib/flyerScroll";

/**
 * The public layout stays mounted across catalogue pages, so the window
 * offset survives a footer click. Next then skips its own scroll when the
 * new page's top already counts as on screen, and the shared footer can
 * stay pinned in view. A push onto /fletushka scrolls to the top. Reload
 * and back/forward keep the browser's position.
 */
let appReady = false;
let historyRestore = false;
let suppressDocumentScroll = false;
let decidedDocumentScroll = false;
/** A primary click on a link to /fletushka. Back/forward never sets this. */
let armedPush = false;
let releasePin: (() => void) | null = null;

function armAnchor() {
  const footer = document.querySelector("footer");
  document.documentElement.style.overflowAnchor = "none";
  if (footer instanceof HTMLElement) footer.style.overflowAnchor = "none";
}

function disarmAnchor() {
  const footer = document.querySelector("footer");
  document.documentElement.style.overflowAnchor = "";
  if (footer instanceof HTMLElement) footer.style.overflowAnchor = "";
}

function isPlainFlyerLinkClick(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (!(event.target instanceof Element)) return false;
  const anchor = event.target.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin || !isFlyerCataloguePath(url.pathname)) return false;
  // Already on this catalogue view. Don't arm a reset the layout effect will not rerun.
  return !(isFlyerCataloguePath(window.location.pathname) && url.search === window.location.search);
}

if (typeof window !== "undefined") {
  const noteHistoryNavigation = () => {
    armedPush = false;
    releasePin?.();
    historyRestore = isFlyerCataloguePath(window.location.pathname);
  };
  window.addEventListener("popstate", noteHistoryNavigation);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) noteHistoryNavigation();
  });
  // Capture runs before Next handles the link, so the shared footer cannot
  // stay the scroll anchor while the catalogue swaps in.
  window.addEventListener(
    "click",
    (event) => {
      if (!isPlainFlyerLinkClick(event)) return;
      armedPush = true;
      armAnchor();
    },
    true,
  );
}

function ensureDocumentScrollDecision() {
  if (decidedDocumentScroll) {
    return;
  }
  decidedDocumentScroll = true;
  appReady = true;
  const entry = performance.getEntriesByType("navigation")[0];
  if (!entry) {
    suppressDocumentScroll = true;
    return;
  }
  try {
    suppressDocumentScroll = isFlyerCataloguePath(new URL(entry.name).pathname);
  } catch {
    suppressDocumentScroll = true;
  }
}

function canResetFlyerScroll(): boolean {
  ensureDocumentScrollDecision();
  return shouldResetFlyerScroll({
    appReady: appReady || armedPush,
    historyRestore: armedPush ? false : historyRestore,
    suppressDocumentScroll: armedPush ? false : suppressDocumentScroll,
    hash: window.location.hash,
  });
}

function scrollFlyerToTop() {
  window.scrollTo(0, 0);
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.closest("footer")) {
    document.getElementById("main")?.focus({ preventScroll: true });
  }
}

/**
 * The loading skeleton is short, so the window clamps, and the previous
 * offset is applied again once the real catalogue grows. Pin the top until
 * that growth settles. A history traversal cancels the pin.
 */
function holdFlyerAtTop() {
  releasePin?.();
  armAnchor();
  const html = document.documentElement;

  const started = performance.now();
  let stopped = false;
  let lastHeight = -1;
  let stableFrames = 0;
  let frame = 0;
  const step = () => {
    if (stopped || historyRestore) return;
    scrollFlyerToTop();
    const height = html.scrollHeight;
    stableFrames = height === lastHeight ? stableFrames + 1 : 0;
    lastHeight = height;
    const elapsed = performance.now() - started;
    if (elapsed < 2500 && (elapsed < 800 || stableFrames < 2)) {
      frame = requestAnimationFrame(step);
      return;
    }
    disarmAnchor();
  };
  const stopForUser = () => {
    if (performance.now() - started < 400) return;
    stopped = true;
    cancelAnimationFrame(frame);
    disarmAnchor();
  };
  window.addEventListener("wheel", stopForUser, { passive: true });
  window.addEventListener("touchmove", stopForUser, { passive: true });
  step();

  const release = () => {
    stopped = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("wheel", stopForUser);
    window.removeEventListener("touchmove", stopForUser);
    disarmAnchor();
    if (releasePin === release) releasePin = null;
  };
  releasePin = release;
  return release;
}

/** Mounted for the life of the public layout. Hears back/forward before the page does. */
export function FlyerScrollListener() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    ensureDocumentScrollDecision();
    if (!isFlyerCataloguePath(pathname)) {
      armedPush = false;
      releasePin?.();
      historyRestore = false;
      suppressDocumentScroll = false;
      return;
    }
    if (!canResetFlyerScroll()) {
      armedPush = false;
      disarmAnchor();
      return;
    }
    armedPush = false;
    historyRestore = false;
    suppressDocumentScroll = false;
    return holdFlyerAtTop();
  }, [pathname]);

  return null;
}

/**
 * Mounted with the flyer page, including the commit that replaces the loading
 * skeleton. By then the URL has not changed, so the layout effect will not run again.
 */
export function ResetFlyerScroll() {
  useLayoutEffect(() => {
    if (!canResetFlyerScroll()) {
      return;
    }
    armedPush = false;
    historyRestore = false;
    suppressDocumentScroll = false;
    return holdFlyerAtTop();
  }, []);

  return null;
}
