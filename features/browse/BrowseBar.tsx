import Link from "next/link";
import { browsePath } from "@/lib/browse";
import type { CategorySummary } from "@/types";

type BrowseBarProps = {
  basePath?: string;
  q?: string;
  category?: string;
  categories: CategorySummary[];
};

export function BrowseBar({
  basePath = "/",
  q = "",
  category,
  categories,
}: BrowseBarProps) {
  return (
    <div className="browse">
      <form className="browse__form" action={basePath} method="get">
        {category ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
        <label className="browse__search">
          <span className="visually-hidden">Kërko</span>
          <input
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="Kërko ofertë ose dyqan"
          />
        </label>
        <button className="btn btn--primary" type="submit">
          Kërko
        </button>
      </form>
      <nav className="browse__chips" aria-label="Kategoritë">
        <Link
          href={browsePath(basePath, { q })}
          className={category ? "browse__chip" : "browse__chip is-active"}
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
              item.slug === category ? "browse__chip is-active" : "browse__chip"
            }
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
