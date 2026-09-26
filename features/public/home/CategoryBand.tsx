import Link from "next/link";
import { Frame, SeeAll } from "@/features/public/Frame";
import { kicker } from "@/features/public/tone";
import { browsePath } from "@/lib/browse";
import type { CategorySummary } from "@/types";

export function CategoryBand({
  categories,
  title = "Shfleto sipas llojit.",
}: {
  categories: CategorySummary[];
  title?: string;
}) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-10 sm:pt-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={kicker}>Kategori</p>
          <h2 className="m-0 mt-1 text-2xl leading-none font-extrabold tracking-[-0.04em] sm:text-3xl">
            {title}
          </h2>
        </div>
        <SeeAll href="/?katalog=oferta">Të gjitha ofertat</SeeAll>
      </div>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={browsePath("/", { category: category.slug })}
            className="flex h-16 w-40 shrink-0 items-end rounded-xl border border-line bg-elevated px-3 py-2.5 shadow-[inset_0_3px_0_var(--color-accent)] hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:transition-colors dark:border-white/10 dark:bg-[#1a2420]"
          >
            <span className="line-clamp-2 text-sm leading-tight font-extrabold">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </Frame>
  );
}
