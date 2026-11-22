import type { ReactNode } from "react";

/**
 * Below `md`, dashboard table rows render as cards. The desktop subgrid classes
 * on each row/cell stay untouched; everything here is additive `max-md:` classes,
 * so the DOM stays single (no duplicated cells, ids or tab stops).
 *
 * Card order (set with `order`, DOM order is the table's column order):
 *   1 title (+ status badge) · 2 status · 3 labelled meta cells · 4 actions · 5 expanded detail
 */

/** Append to a row's classes (the `<li>` that is `grid ... md:grid-cols-subgrid`). */
export const dataRowCard = "max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-2";

export const dataCell = {
  /**
   * Title cell: top of the card. The large basis leaves room for one status badge of up to
   * 8.25rem (the 9rem basis minus the 0.75rem gap) on the same line; a wider badge drops to
   * its own line. Meta cells (order 3) can never squeeze in beside the title.
   */
  title: "max-md:order-1 max-md:min-w-0 max-md:grow max-md:basis-[calc(100%-9rem)]",
  /** Title on its own line (rows without a status cell). */
  titleFull: "max-md:order-1 max-md:min-w-0 max-md:grow max-md:basis-full",
  /** Apply to the title text (Link/p that uses `truncate` on desktop). */
  titleText: "max-md:whitespace-normal max-md:break-words",
  /** Single status badge: next to the title. */
  status: "max-md:order-2 max-md:shrink-0",
  /** Status cell that can hold several badges: own line under the title. */
  statusWide: "max-md:order-2 max-md:basis-full",
  /** Inline meta value (use with `<CellLabel>`), shares one wrapping line. */
  meta: "max-md:order-3 max-md:min-w-0 max-md:max-w-full max-md:whitespace-normal max-md:break-words",
  /** Short value (date, period) that must not break mid-value. */
  metaNowrap: "max-md:order-3 max-md:max-w-full max-md:whitespace-nowrap",
  /** Meta value that gets its own line (multi-line or long content). */
  metaWide: "max-md:order-3 max-md:min-w-0 max-md:basis-full",
  /** Action cell: bottom of the card, drops the desktop column divider. */
  actions: "max-md:order-4 max-md:basis-full max-md:flex-wrap max-md:border-l-0 max-md:pl-0",
} as const;

/**
 * Column heading shown only below `md` (the header row is hidden there).
 * `display: none` at `md+` also removes it from the accessibility tree, so
 * desktop screen readers never hear it twice next to the real header.
 */
export function CellLabel({
  children,
  block = false,
}: {
  children?: ReactNode;
  /** Own line above the value instead of an inline "Label: " prefix. */
  block?: boolean;
}) {
  return block ? (
    <span className="mb-0.5 block w-full text-xs font-bold tracking-[0.08em] text-muted uppercase md:hidden">
      {children}
    </span>
  ) : (
    <span className="font-medium text-muted md:hidden">{children}: </span>
  );
}
