import { ExclusiveCard } from "@/features/public/ExclusiveCard";
import type { ExclusiveItem } from "@/features/offers/api";

export function ExclusiveList({ items }: { items: ExclusiveItem[] }) {
  const [lead, ...rest] = items;

  return (
    <div className="grid gap-8">
      {lead ? <ExclusiveCard item={lead} layout="feature" /> : null}
      {rest.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-6 p-0 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
          {rest.map((item) =>
            item.kind === "flyer" ? (
              <li key={`flyer:${item.flyer.id}`} className="col-span-2 min-w-0">
                <ExclusiveCard item={item} layout="tile" />
              </li>
            ) : (
              <li key={`offer:${item.offer.id}`} className="min-w-0">
                <ExclusiveCard item={item} layout="tile" />
              </li>
            ),
          )}
        </ul>
      ) : null}
    </div>
  );
}
