import type { Metadata } from "next";
import { BizNewOfferScreen } from "@/features/offers/BizNewOfferScreen";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Fletushkë e re",
  robots: { index: false, follow: false },
};

export default function BizNewFlyerPage() {
  return <PageWidth variant="form"><BizNewOfferScreen catalog="flyers" /></PageWidth>;
}
