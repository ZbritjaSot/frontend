import Link from "next/link";
import {
  formatDateShortSq,
  formatDiscountPercent,
  formatEurFromCents,
} from "@/lib/format";
import type { PublicOffer } from "@/types";

type OfferListItemProps = {
  offer: PublicOffer;
};

export function OfferListItem({ offer }: OfferListItemProps) {
  return (
    <li>
      <Link
        href={`/offers/${offer.id}`}
        className="group flex flex-col gap-3 border-b border-line py-5 min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between min-[720px]:gap-8"
      >
        <div className="flex min-w-0 items-start gap-5">
          <span
            className="inline-flex min-w-[3.25rem] shrink-0 items-center justify-center rounded-md bg-accent px-2 py-1.5 text-[0.9375rem] font-bold leading-none tracking-[-0.02em] text-on-accent"
            aria-hidden
          >
            {formatDiscountPercent(offer.discount_percent)}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[1.0625rem] font-semibold leading-[1.3] underline-offset-[0.2em] group-hover:underline group-hover:decoration-accent">
              {offer.name}
            </span>
            <span className="text-sm text-muted">
              {offer.business?.name ?? "Dyqan"}
              {offer.bundle?.title ? ` · ${offer.bundle.title}` : ""}
              {offer.category ? ` · ${offer.category.name}` : ""}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 min-[720px]:flex-col min-[720px]:items-end min-[720px]:gap-[0.2rem] min-[720px]:text-right">
          <span className="text-lg font-bold text-ink dark:text-accent">
            {formatEurFromCents(offer.discounted_price)}
          </span>
          <span className="text-sm text-muted line-through">
            {formatEurFromCents(offer.original_price)}
          </span>
          <span className="w-full text-xs text-muted min-[720px]:w-auto">
            deri më {formatDateShortSq(offer.expires_at)}
          </span>
        </div>
      </Link>
    </li>
  );
}
