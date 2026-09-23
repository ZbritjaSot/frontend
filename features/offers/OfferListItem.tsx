import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
  const shop = offer.business?.name ?? "Dyqan";

  return (
    <li>
      <Link
        href={`/offers/${offer.id}`}
        className="group flex items-center gap-3 rounded-2xl border border-line bg-elevated px-4 py-4 transition-colors hover:border-accent/70 sm:gap-5 sm:px-5"
      >
        <span
          className="inline-flex min-w-14 shrink-0 items-center justify-center rounded-xl bg-accent px-2 py-2 text-base leading-none font-extrabold tracking-[-0.02em] text-charcoal"
          aria-hidden
        >
          {formatDiscountPercent(offer.discount_percent)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-semibold leading-snug text-ink sm:text-[1.0625rem]">
            {offer.name}
          </span>
          <span className="mt-1 block truncate text-sm text-muted">
            {shop}
            {offer.category ? ` · ${offer.category.name}` : ""}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-lg leading-none font-bold text-ink dark:text-accent">
            {formatEurFromCents(offer.discounted_price)}
          </span>
          <span className="mt-1 block text-sm text-muted line-through">
            {formatEurFromCents(offer.original_price)}
          </span>
          <span className="mt-1 block text-xs text-muted">
            deri më {formatDateShortSq(offer.expires_at)}
          </span>
        </span>
        <ChevronRightIcon
          fontSize="small"
          className="shrink-0 text-muted transition-colors group-hover:text-accent"
        />
      </Link>
    </li>
  );
}
