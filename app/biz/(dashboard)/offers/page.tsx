import type { Metadata } from "next";
import { BizOfferList } from "@/features/offers/BizOfferList";

export const metadata: Metadata = {
  title: "Ofertat",
  robots: { index: false, follow: false },
};

export default function BizOffersPage() {
  return <BizOfferList />;
}
