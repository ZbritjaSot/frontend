import { OfferListItem } from "@/features/offers/OfferListItem";
import type { PublicOffer } from "@/types";

type OfferListProps = {
  offers: PublicOffer[];
};

export function OfferList({ offers }: OfferListProps) {
  return (
    <ul className="m-0 list-none border-t border-line p-0">
      {offers.map((offer) => (
        <OfferListItem key={offer.id} offer={offer} />
      ))}
    </ul>
  );
}
