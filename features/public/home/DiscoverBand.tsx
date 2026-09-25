import { DiscoverForm } from "@/features/public/DiscoverForm";
import { Frame } from "@/features/public/Frame";
import { kicker } from "@/features/public/tone";
import type { CategorySummary } from "@/types";

export function DiscoverBand({ categories }: { categories: CategorySummary[] }) {
  return (
    <Frame className="pt-8 sm:pt-10">
      <p className={kicker}>Kërko</p>
      <p className="mt-1 mb-3 max-w-xl text-lg leading-snug font-extrabold tracking-[-0.03em]">
        Produkt, fletushkë ose dyqan.
      </p>
      <DiscoverForm categories={categories} showCategories={false} />
    </Frame>
  );
}
