import { DiscoverForm } from "@/features/public/DiscoverForm";
import { Frame } from "@/features/public/Frame";
import type { CategorySummary } from "@/types";

export function DiscoverBand({ categories }: { categories: CategorySummary[] }) {
  return (
    <Frame className="pt-3 pb-1">
      <DiscoverForm categories={categories} showCategories={false} />
    </Frame>
  );
}
