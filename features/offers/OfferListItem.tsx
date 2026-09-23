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
      <Link href={`/offers/${offer.id}`} className="offer-row">
        <div className="offer-row__main">
          <span className="offer-row__discount" aria-hidden>
            {formatDiscountPercent(offer.discount_percent)}
          </span>
          <div className="offer-row__text">
            <span className="offer-row__name">{offer.name}</span>
            <span className="offer-row__meta">
              {offer.business?.name ?? "Dyqan"}
              {offer.bundle?.title ? ` · ${offer.bundle.title}` : ""}
              {offer.category ? ` · ${offer.category.name}` : ""}
            </span>
          </div>
        </div>
        <div className="offer-row__prices">
          <span className="offer-row__now">
            {formatEurFromCents(offer.discounted_price)}
          </span>
          <span className="offer-row__was">
            {formatEurFromCents(offer.original_price)}
          </span>
          <span className="offer-row__until">
            deri më {formatDateShortSq(offer.expires_at)}
          </span>
        </div>
      </Link>
    </li>
  );
}
