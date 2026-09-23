import Link from "next/link";
import { OfferPlace } from "@/components/place/OfferPlace";
import {
  formatDateSq,
  formatDiscountPercent,
  formatEurFromCents,
} from "@/lib/format";
import type { PublicOffer } from "@/types";

type OfferDetailProps = {
  offer: PublicOffer;
};

export function OfferDetail({ offer }: OfferDetailProps) {
  return (
    <article className="offer-detail">
      <p className="offer-detail__eyebrow">
        {offer.business?.name ?? "Ofertë"}
        {offer.bundle?.title ? ` · ${offer.bundle.title}` : ""}
        {offer.category ? ` · ${offer.category.name}` : ""}
      </p>

      <p className="offer-detail__discount" aria-label="Zbritja">
        {formatDiscountPercent(offer.discount_percent)}
      </p>

      <h1 className="offer-detail__title">{offer.name}</h1>

      <div className="offer-detail__prices">
        <span className="offer-detail__now">
          {formatEurFromCents(offer.discounted_price)}
        </span>
        <span className="offer-detail__was">
          {formatEurFromCents(offer.original_price)}
        </span>
      </div>

      <dl className="offer-detail__facts">
        <div>
          <dt>Fillon</dt>
          <dd>{formatDateSq(offer.starts_at)}</dd>
        </div>
        <div>
          <dt>Skadon</dt>
          <dd>{formatDateSq(offer.expires_at)}</dd>
        </div>
      </dl>

      {offer.business ? (
        <OfferPlace
          name={offer.business.name}
          place={{
            address: offer.business.address,
            latitude: offer.business.latitude,
            longitude: offer.business.longitude,
          }}
        />
      ) : null}

      <Link href="/" className="offer-detail__back">
        ← Të gjitha ofertat
      </Link>
    </article>
  );
}
