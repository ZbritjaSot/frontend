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
  "rounded-full border px-[0.8rem] py-[0.35rem] text-sm no-underline";

export function BrowseBar({
  basePath = "/",
  q = "",
  category,
  categories,
}: BrowseBarProps) {
  return (
    <div className="mb-14 grid gap-[0.85rem]">
      <form className="flex flex-wrap gap-2" action={basePath} method="get">
        {category ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
        <label className="relative min-w-0 flex-[1_1_14rem]">
          <span className="sr-only">Kërko</span>
          <SearchIcon
            fontSize="small"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="Kërko ofertë ose dyqan"
            className="w-full min-h-11 rounded-lg border border-line bg-elevated py-[0.65rem] pr-[0.85rem] pl-10 text-base text-ink outline-2 outline-offset-1 focus:outline-accent"
          />
        </label>
        <button className={btnPrimary} type="submit">
          Kërko
        </button>
      </form>
      <nav className="flex flex-wrap gap-[0.4rem]" aria-label="Kategoritë">
        <Link
          href={browsePath(basePath, { q })}
          className={
            category
              ? `${chipClass} border-line text-inherit`
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
                : `${chipClass} border-line text-inherit`
            }
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
