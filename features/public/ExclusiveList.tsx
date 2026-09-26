import { CampaignPoster } from "@/features/public/CampaignPoster";
import { ProductPoster } from "@/features/public/ProductPoster";
import type { ExclusiveItem } from "@/features/offers/api";

export function ExclusiveList({ items }: { items: ExclusiveItem[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-5 p-0 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
      {items.map((item) =>
        item.kind === "flyer" ? (
          <li key={`flyer:${item.flyer.id}`} className="col-span-2 min-w-0 lg:col-span-2">
            <CampaignPoster folder={item.flyer} layout="card" eager />
          </li>
        ) : (
          <li key={`offer:${item.offer.id}`} className="min-w-0">
            <ProductPoster offer={item.offer} eager />
          </li>
        ),
      )}
    </ul>
  );
}
