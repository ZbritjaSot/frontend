import type { Metadata } from "next";
import { BizNewOfferScreen } from "@/features/offers/BizNewOfferScreen";

export const metadata: Metadata = {
  title: "Oferta të reja",
  robots: { index: false, follow: false },
};

export default function BizNewOffersPage() {
  return <BizNewOfferScreen catalog="offers" />;
}
