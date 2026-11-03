/** The public flyer catalogue. Search params are not part of the pathname. */
export function isFlyerCataloguePath(pathname: string): boolean {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return path === "/fletushka";
}

/**
 * A push onto the flyer catalogue starts at the top.
 * The document's own load keeps the browser's reload position, and
 * back/forward keeps the history position. A hash other than `#top` is left
 * for the browser.
 */
export function shouldResetFlyerScroll(input: {
  appReady: boolean;
  historyRestore: boolean;
  suppressDocumentScroll: boolean;
  hash: string;
}): boolean {
  if (!input.appReady || input.historyRestore || input.suppressDocumentScroll) {
    return false;
  }
  const fragment = input.hash.startsWith("#") ? input.hash.slice(1) : input.hash;
  return fragment === "" || fragment === "top";
}
