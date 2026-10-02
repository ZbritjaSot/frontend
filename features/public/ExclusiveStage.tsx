"use client";

import { ExclusiveCard } from "@/features/public/ExclusiveCard";
import type { ExclusiveItem } from "@/features/offers/api";
import {
  EXCLUSIVE_GRID_ALIGN,
  EXCLUSIVE_PAGE_SIZE,
} from "@/features/public/exclusiveConstants";

export { EXCLUSIVE_GRID_ALIGN, EXCLUSIVE_PAGE_SIZE };

export function ExclusiveStage({
  items,
  hasMore = false,
}: {
  items: ExclusiveItem[];
  hasMore?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  const [lead, ...rest] = items;
  const complete = Math.floor(rest.length / EXCLUSIVE_GRID_ALIGN) * EXCLUSIVE_GRID_ALIGN;
  const grid = hasMore && complete > 0 ? rest.slice(0, complete) : rest;

  return (
    <div className="grid gap-14 sm:gap-16 lg:gap-20">
      {lead ? (
        <section className="grid gap-5 sm:gap-6">
          <div className="flex items-center gap-4">
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.22em] text-muted uppercase">
              Në fokus
            </p>
            <span aria-hidden className="h-px flex-1 bg-line dark:bg-white/10" />
          </div>
          <ExclusiveCard item={lead} layout="feature" />
        </section>
      ) : null}

      {grid.length > 0 ? (
        <section className="grid gap-6 sm:gap-8">
          <div className="flex items-center gap-4">
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.22em] text-muted uppercase">
              Koleksioni
            </p>
            <span aria-hidden className="h-px flex-1 bg-line dark:bg-white/10" />
          </div>
          <ul className="m-0 grid list-none grid-cols-2 items-stretch gap-x-3 gap-y-7 p-0 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10 xl:grid-cols-4">
            {grid.map((item) => (
              <li key={itemKey(item)} className="min-w-0">
                <ExclusiveCard item={item} layout="tile" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function itemKey(item: ExclusiveItem): string {
  return item.kind === "flyer" ? `flyer:${item.flyer.id}` : `offer:${item.offer.id}`;
}
