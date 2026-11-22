import type { Metadata } from "next";
import { BizOfferList } from "@/features/offers/BizOfferList";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Ofertat",
  robots: { index: false, follow: false },
};

export default function BizOffersPage() {
  return <PageWidth variant="list"><BizOfferList catalog="offers" /></PageWidth>;
}
