import { CategoryChip } from "@/features/public/CategoryChip";
import { browsePath, type CatalogSort, type Katalog } from "@/lib/browse";
import { button } from "@/lib/ui";
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
  placeholder = "Kërko produkte, dyqane, fletushka",
}: DiscoverFormProps) {
  return (
    <div className={catalog ? "flex flex-col gap-3" : "grid gap-5"} id="kerko">
      <form
        action={basePath}
        method="get"
        className={
          catalog
            ? "flex w-full max-w-xl items-center rounded-full border border-line bg-elevated pr-1 transition-[border-color,box-shadow] duration-150 has-[input:focus]:border-focus has-[input:focus]:ring-1 has-[input:focus]:ring-focus dark:border-white/10 dark:bg-white/[0.04]"
            : "flex items-center rounded-full border border-line bg-elevated transition-[border-color,box-shadow] duration-150 has-[input:focus]:border-focus has-[input:focus]:ring-1 has-[input:focus]:ring-focus dark:border-white/10 dark:bg-[#141c18]"
        }
      >
        {category ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
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
                ? "h-11 w-full min-w-0 border-0 bg-transparent pr-3 pl-10 text-base text-ink outline-hidden placeholder:text-muted/70"
                : "h-14 w-full border-0 bg-transparent pr-3 pl-12 text-base text-ink outline-hidden placeholder:text-muted/70"
            }
          />
        </label>
        <button
          type="submit"
          className={
            catalog
              ? `${button({ size: "sm", shape: "pill" })} my-1`
              : `${button({ shape: "pill" })} m-1.5`
          }
        >
          Kërko
        </button>
      </form>

      {showCategories && categories.length > 0 ? (
        <nav
          className="-mx-5 flex gap-1 overflow-x-auto overscroll-x-contain px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          aria-label="Kategoritë"
        >
          <CategoryChip
            name="Të gjitha"
            icon="grid_view"
            active={!category}
            href={browsePath(basePath, { q, katalog, city, sort })}
          />
          {categories.map((item) => {
            const active = item.slug === category;
            return (
              <CategoryChip
                key={item.id}
                name={item.name}
                icon={item.icon}
                active={active}
                href={browsePath(basePath, {
                  q,
                  katalog,
                  city,
                  sort,
                  category: active ? null : item.slug,
                })}
              />
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
