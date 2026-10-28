"use client";

import { ExclusiveCard } from "@/features/public/ExclusiveCard";
import { Frame } from "@/features/public/Frame";
import { ExclusiveMark } from "@/features/public/exclusiveChrome";
import { StepRail } from "@/features/public/StepRail";
import type { ExclusiveItem } from "@/features/offers/api";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";

/**
 * Homepage exclusive rail — forest surface, original card rail layout,
 * auto-advancing one card at a time with a seamless loop.
 */
export function ExclusiveBand({
  items,
  title = EXCLUSIVE_LABEL,
}: {
  items: ExclusiveItem[];
  title?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 overflow-x-clip bg-forest text-ivory sm:mt-10">
      <Frame className="pt-10 pb-0 sm:pt-12">
        <div className="min-w-0 max-w-xl">
          <ExclusiveMark size="md" />
          <h2 className="m-0 mt-4 text-[clamp(2rem,4vw,2.85rem)] leading-[0.95] font-extrabold tracking-[-0.045em] text-ivory">
            {title}
          </h2>
          <p className="mt-3 mb-0 max-w-sm text-sm leading-relaxed text-ivory/60">
            Një përzgjedhje e vogël e zbritjeve që vlejnë vëmendjen.
          </p>
        </div>
      </Frame>

      <StepRail
        items={items}
        ariaLabel={title}
        getKey={itemKey}
        viewportClassName="overflow-hidden px-5 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-12"
        renderItem={(item, clone) => (
          <ExclusiveCard item={item} layout="rail" inertClone={clone} />
        )}
      />
    </section>
  );
}

function itemKey(item: ExclusiveItem): string {
  return item.kind === "flyer" ? `flyer:${item.flyer.id}` : `offer:${item.offer.id}`;
}
