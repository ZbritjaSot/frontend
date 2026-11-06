import Link from "next/link";
import { browsePath, type CatalogSort, type Katalog } from "@/lib/browse";
import type { CategorySummary } from "@/types";

type FilterChipsProps = {
  basePath: string;
  katalog?: Katalog;
  q?: string;
  category?: string;
  city?: string;
  sort?: CatalogSort;
  categories?: CategorySummary[];
};

/** Removable chips for the active search/category/city filters, plus a "clear all" link. */
export function FilterChips({
  basePath,
  katalog,
  q,
  category,
  city,
  sort,
  categories = [],
}: FilterChipsProps) {
  const hasQuery = Boolean(q?.trim());
  const hasCategory = Boolean(category);
  const hasCity = Boolean(city);

  if (!hasQuery && !hasCategory && !hasCity) {
    return null;
  }

  const categoryName = categories.find((item) => item.slug === category)?.name ?? category;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Filtrat aktive">
      {hasQuery ? (
        <FilterChip
          label={`“${q}”`}
          href={browsePath(basePath, { category, katalog, city, sort, q: "" })}
        />
      ) : null}
      {hasCategory ? (
        <FilterChip
          label={categoryName ?? ""}
          href={browsePath(basePath, { q, katalog, city, sort, category: null })}
        />
      ) : null}
      {hasCity ? (
        <FilterChip
          label={city ?? ""}
          href={browsePath(basePath, { q, category, katalog, sort, city: null })}
        />
      ) : null}
      <Link
        href={browsePath(basePath, { katalog, sort })}
        className="inline-flex h-7 shrink-0 items-center rounded-full px-2 text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        Pastro të gjitha
      </Link>
    </div>
  );
}

function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      aria-label={`Hiq filtrin: ${label}`}
      className="inline-flex h-7 max-w-52 shrink-0 items-center gap-1.5 rounded-full border border-line bg-sunken px-3 text-xs font-semibold text-ink no-underline hover:border-slate/45 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:border-white/10 dark:bg-white/[0.06]"
    >
      <span className="min-w-0 truncate">{label}</span>
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3 shrink-0" fill="none">
        <path
          d="M4 4l8 8M12 4l-8 8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
