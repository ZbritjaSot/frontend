import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import { browsePath } from "@/lib/browse";
import { btnPrimary } from "@/lib/ui";
import type { CategorySummary } from "@/types";

type BrowseBarProps = {
  basePath?: string;
  q?: string;
  category?: string;
  categories: CategorySummary[];
};

const chipClass =
  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold whitespace-nowrap no-underline";

export function BrowseBar({
  basePath = "/",
  q = "",
  category,
  categories,
}: BrowseBarProps) {
  return (
    <div className="mb-8 grid gap-4">
      <form
        className="flex min-h-12 overflow-hidden rounded-xl border border-line bg-elevated focus-within:border-accent"
        action={basePath}
        method="get"
      >
        {category ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Kërko</span>
          <SearchIcon
            fontSize="small"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
          />
          <input
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="Kërko ofertë ose dyqan"
            className="h-12 w-full border-0 bg-transparent pr-3 pl-11 text-base text-ink outline-none"
          />
        </label>
        <button className={`${btnPrimary} rounded-none px-5`} type="submit">
          Kërko
        </button>
      </form>
      <nav
        className="-mx-5 flex gap-2 overflow-x-auto overscroll-x-contain px-5 pb-2.5 sm:mx-0 sm:px-0"
        aria-label="Kategoritë"
      >
        <Link
          href={browsePath(basePath, { q })}
          className={
            category
              ? `${chipClass} border-line bg-elevated text-ink hover:border-accent/60`
              : `${chipClass} border-transparent bg-accent text-charcoal`
          }
        >
          Të gjitha
        </Link>
        {categories.map((item) => (
          <Link
            key={item.id}
            href={browsePath(basePath, {
              q,
              category: item.slug === category ? null : item.slug,
            })}
            className={
              item.slug === category
                ? `${chipClass} border-transparent bg-accent text-charcoal`
                : `${chipClass} border-line bg-elevated text-ink hover:border-accent/60`
            }
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
