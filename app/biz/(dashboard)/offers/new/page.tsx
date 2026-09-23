import type { Metadata } from "next";
import { OfferForm } from "@/features/offers/OfferForm";
import { OffersBackHeading } from "@/features/offers/EditOfferScreen";

export const metadata: Metadata = {
  title: "Dosje e re",
  robots: { index: false, follow: false },
};

export default function NewBizOfferPage() {
  return (
    <>
      <OffersBackHeading title="Dosje e re" />
      <OfferForm mode="create" />
    </>
  );
}
