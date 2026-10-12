import type { Metadata } from "next";
import { BizNewOfferScreen } from "@/features/offers/BizNewOfferScreen";

export const metadata: Metadata = {
  title: "Fletushkë e re",
  robots: { index: false, follow: false },
};

export default function BizNewFlyerPage() {
  return <BizNewOfferScreen catalog="flyers" />;
}
