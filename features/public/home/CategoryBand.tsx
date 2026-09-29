import { CategoryChip } from "@/features/public/CategoryChip";
import { Frame } from "@/features/public/Frame";
import { browsePath } from "@/lib/browse";
import type { CategorySummary } from "@/types";

export function CategoryBand({ categories }: { categories: CategorySummary[] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-3 pb-8 sm:pb-10">
      <nav
        className="-mx-5 flex gap-1 overflow-x-auto overscroll-x-contain px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
        aria-label="Kategoritë"
      >
        <CategoryChip
          name="Të gjitha"
          icon="grid_view"
          active
          href={browsePath("/", { katalog: "oferta" })}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            name={category.name}
            icon={category.icon}
            href={browsePath("/", { katalog: "oferta", category: category.slug })}
          />
        ))}
      </nav>
    </Frame>
  );
}
