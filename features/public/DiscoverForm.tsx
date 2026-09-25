import Link from "next/link";
import { browsePath, type Katalog } from "@/lib/browse";
import type { CategorySummary } from "@/types";

type DiscoverFormProps = {
  basePath?: string;
  q?: string;
  category?: string;
  katalog?: Katalog;
  categories: CategorySummary[];
  /** Home uses a separate category band, so the field can stand alone. */
  showCategories?: boolean;
  placeholder?: string;
};

const chip =
  "inline-flex min-h-11 shrink-0 items-center rounded-full px-3.5 text-sm font-semibold whitespace-nowrap no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function DiscoverForm({
  basePath = "/",
  q = "",
  category,
  katalog,
  categories,
  showCategories = true,
  placeholder = "Kërko produkt, fletushkë ose dyqan",
}: DiscoverFormProps) {
  return (
    <div className="grid gap-5" id="kerko">
      <form
        action={basePath}
        method="get"
        className="flex items-center rounded-full border border-line bg-elevated focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/50 dark:border-white/10 dark:bg-[#141c18]"
      >
        {category ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
        {katalog ? <input type="hidden" name="katalog" value={katalog} /> : null}
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Kërko</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
            fill="none"
          >
            <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="2" />
            <path
              d="M15.5 15.5 20 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder={placeholder}
            className="h-14 w-full border-0 bg-transparent pr-3 pl-12 text-base text-ink outline-none placeholder:text-muted"
          />
        </label>
          <button
          type="submit"
          className="m-1.5 inline-flex min-h-11 shrink-0 cursor-pointer appearance-none items-center rounded-full border-0 bg-accent px-5 text-sm font-extrabold text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Kërko
        </button>
      </form>

      {showCategories && categories.length > 0 ? (
        <nav
          className="-mx-5 flex gap-x-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          aria-label="Kategoritë"
        >
          <Link
            href={browsePath(basePath, { q, katalog })}
            className={
              category
                ? `${chip} text-muted ring-1 ring-line hover:text-ink`
                : `${chip} bg-accent text-charcoal`
            }
          >
            Të gjitha
          </Link>
          {categories.map((item) => {
            const active = item.slug === category;
            return (
              <Link
                key={item.id}
                href={browsePath(basePath, {
                  q,
                  katalog,
                  category: active ? null : item.slug,
                })}
                className={
                  active
                    ? `${chip} bg-accent text-charcoal`
                    : `${chip} text-ink ring-1 ring-line hover:bg-hover`
                }
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
