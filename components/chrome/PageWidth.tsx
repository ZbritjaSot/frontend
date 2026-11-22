import type { PropsWithChildren } from "react";

export type PageWidthVariant = "list" | "form" | "wide";

const widthClass: Record<PageWidthVariant, string> = {
  list: "max-w-6xl",
  form: "max-w-3xl",
  wide: "max-w-7xl",
};

/**
 * Caps a dashboard page to a readable width. Left-aligned inside the main column
 * so the page title, filters and row actions keep a stable left edge.
 * Variants: list = tables and card lists, form = single-column forms, wide = home panels.
 */
export function PageWidth({
  variant,
  children,
}: PropsWithChildren<{ variant: PageWidthVariant }>) {
  return <div className={`w-full min-w-0 ${widthClass[variant]}`}>{children}</div>;
}
