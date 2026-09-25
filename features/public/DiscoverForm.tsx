import Link from "next/link";
import { browsePath, type CatalogSort, type Katalog } from "@/lib/browse";
import type { CategorySummary } from "@/types";

type DiscoverFormProps = {
  basePath?: string;
  q?: string;
  category?: string;
  katalog?: Katalog;
  city?: string;
  sort?: CatalogSort;
  categories: CategorySummary[];
  /** Home uses a separate category band, so the field can stand alone. */
  showCategories?: boolean;
  /** Catalogue pages use a shorter field and a scrolling category row. */
  catalog?: boolean;
  placeholder?: string;
};

const chip =
  "inline-flex min-h-11 shrink-0 items-center rounded-full px-3.5 text-sm font-semibold whitespace-nowrap no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const catalogChip =
  "inline-flex h-8 shrink-0 items-center rounded-full px-3 text-[0.8125rem] leading-none font-semibold whitespace-nowrap no-underline transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const catalogChipActive = `${catalogChip} bg-accent text-charcoal`;

const catalogChipIdle = `${catalogChip} text-muted hover:bg-hover hover:text-ink`;

export function DiscoverForm({
  basePath = "/",
  q = "",
  category,
  katalog,
  city,
  sort = "newest",
  categories,
  showCategories = true,
  catalog = false,
  placeholder = "Kërko produkt, fletushkë ose dyqan",
}: DiscoverFormProps) {
  return (
    <div className={catalog ? "flex flex-col gap-3" : "grid gap-5"} id="kerko">
      <form
        action={basePath}
        method="get"
        className={
          catalog
            ? "flex w-full max-w-xl items-center rounded-full border border-line bg-elevated pr-1 transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40 dark:border-white/10 dark:bg-white/[0.04]"
            : "flex items-center rounded-full border border-line bg-elevated focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/50 dark:border-white/10 dark:bg-[#141c18]"
        }
      >
        {category ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
        {katalog ? <input type="hidden" name="katalog" value={katalog} /> : null}
        {city ? <input type="hidden" name="city" value={city} /> : null}
        {sort !== "newest" ? <input type="hidden" name="sort" value={sort} /> : null}
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Kërko</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={
              catalog
                ? "pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
                : "pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
            }
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
            className={
              catalog
                ? "h-11 w-full min-w-0 border-0 bg-transparent pr-3 pl-10 text-sm text-ink outline-none placeholder:text-muted"
                : "h-14 w-full border-0 bg-transparent pr-3 pl-12 text-base text-ink outline-none placeholder:text-muted"
            }
          />
        </label>
        <button
          type="submit"
          className={
            catalog
              ? "my-1.5 inline-flex h-8 shrink-0 cursor-pointer appearance-none items-center rounded-full border-0 bg-accent px-3.5 text-[0.8125rem] font-bold text-charcoal transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              : "m-1.5 inline-flex min-h-11 shrink-0 cursor-pointer appearance-none items-center rounded-full border-0 bg-accent px-5 text-sm font-extrabold text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          }
        >
          Kërko
        </button>
      </form>

      {showCategories && categories.length > 0 ? (
        <nav
          className={
            catalog
              ? "flex gap-1 overflow-x-auto [scrollbar-width:none] max-sm:[mask-image:linear-gradient(to_right,black_calc(100%-2.25rem),transparent)] [&::-webkit-scrollbar]:hidden"
              : "-mx-5 flex gap-x-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          }
          aria-label="Kategoritë"
        >
          <Link
            href={browsePath(basePath, { q, katalog, city, sort })}
            aria-current={category ? undefined : "true"}
            className={
              catalog
                ? category
                  ? catalogChipIdle
                  : catalogChipActive
                : category
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
                  city,
                  sort,
                  category: active ? null : item.slug,
                })}
                aria-current={active ? "true" : undefined}
                className={
                  catalog
                    ? active
                      ? catalogChipActive
                      : catalogChipIdle
                    : active
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
