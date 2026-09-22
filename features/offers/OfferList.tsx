import { OfferListItem } from "@/features/offers/OfferListItem";
import type { PublicOffer } from "@/types";

type OfferListProps = {
  offers: PublicOffer[];
};

export function OfferList({ offers }: OfferListProps) {
  return (
    <ul className="offer-list">
      {offers.map((offer) => (
        <OfferListItem key={offer.id} offer={offer} />
      ))}
    </ul>
  );
}
