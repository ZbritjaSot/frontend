import type { Metadata } from "next";
import { BizNewOfferScreen } from "@/features/offers/BizNewOfferScreen";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Oferta të reja",
  robots: { index: false, follow: false },
};

export default function BizNewOffersPage() {
  return <PageWidth variant="form"><BizNewOfferScreen catalog="offers" /></PageWidth>;
}
