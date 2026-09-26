import Link from "next/link";
import { Frame } from "@/features/public/Frame";
import { ExclusiveCard } from "@/features/public/ExclusiveCard";
import type { ExclusiveItem } from "@/features/offers/api";
import { EXCLUSIVE_HREF, EXCLUSIVE_LABEL } from "@/lib/exclusive";

export function ExclusiveBand({
  items,
  title = EXCLUSIVE_LABEL,
}: {
  items: ExclusiveItem[];
  title?: string;
}) {
  const shown = items.slice(0, 8);
  if (shown.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-6">
      <section className="overflow-hidden rounded-[1.75rem] bg-forest text-ivory dark:bg-[#121816] dark:text-ink">
        <div className="flex items-end justify-between gap-3 px-5 pt-5 sm:px-6">
          <div>
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.2em] text-accent uppercase">
              {EXCLUSIVE_LABEL}
            </p>
            <h2 className="m-0 mt-1 text-2xl leading-none font-extrabold tracking-[-0.04em] text-ivory sm:text-3xl dark:text-ink">
              {title}
            </h2>
          </div>
          <Link
            href={EXCLUSIVE_HREF}
            className="shrink-0 text-sm font-extrabold text-ivory underline-offset-4 hover:underline dark:text-ink"
          >
            Shiko të gjitha
          </Link>
        </div>
        <div
          className="flex snap-x snap-proximity gap-4 overflow-x-auto px-5 pt-4 pb-5 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
          aria-label={EXCLUSIVE_LABEL}
        >
          {shown.map((item) => (
            <ExclusiveCard
              key={item.kind === "flyer" ? `flyer:${item.flyer.id}` : `offer:${item.offer.id}`}
              item={item}
              layout="rail"
            />
          ))}
        </div>
      </section>
    </Frame>
  );
}
