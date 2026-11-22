import type { Metadata } from "next";
import { BizOfferList } from "@/features/offers/BizOfferList";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Fletushkat",
  robots: { index: false, follow: false },
};

export default function BizFlyersPage() {
  return <PageWidth variant="list"><BizOfferList catalog="flyers" /></PageWidth>;
}
