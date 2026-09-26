import type { Metadata } from "next";
import { BizNewOfferScreen } from "@/features/offers/BizNewOfferScreen";

export const metadata: Metadata = {
  title: "Dosje e re",
  robots: { index: false, follow: false },
};

export default function NewBizOfferPage() {
  return <BizNewOfferScreen />;
}
