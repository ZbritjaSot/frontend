import Link from "next/link";
import { browsePath } from "@/lib/browse";
import type { CategorySummary } from "@/types";

type DiscoverFormProps = {
  basePath?: string;
  q?: string;
  category?: string;
  categories: CategorySummary[];
};

const chip =
  "shrink-0 border-b-2 border-transparent pb-1 text-[0.95rem] font-semibold whitespace-nowrap no-underline";

export function DiscoverForm({
  basePath = "/",
  q = "",
  category,
  categories,
}: DiscoverFormProps) {
  return (
    <div className="grid gap-5">
      <form
        action={basePath}
        method="get"
        className="flex items-center rounded-full bg-white ring-1 ring-line dark:bg-[#141c18] dark:ring-white/10"
      >
        {category ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
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
            placeholder="Kërko produkt, fletushkë ose dyqan"
            className="h-14 w-full border-0 bg-transparent pr-3 pl-12 text-base text-ink outline-none placeholder:text-muted"
          />
        </label>
        <button
          type="submit"
          className="m-1.5 shrink-0 cursor-pointer appearance-none rounded-full border-0 bg-accent px-5 py-2.5 text-sm font-extrabold text-charcoal"
        >
          Kërko
        </button>
      </form>

      {categories.length > 0 ? (
        <nav
          className="-mx-5 flex gap-x-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          aria-label="Kategoritë"
        >
          <Link
            href={browsePath(basePath, { q })}
            className={
              category
                ? `${chip} text-muted hover:text-ink`
                : `${chip} border-accent text-ink`
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
                  category: active ? null : item.slug,
                })}
                className={
                  active
                    ? `${chip} border-accent text-ink`
                    : `${chip} text-muted hover:text-ink`
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
