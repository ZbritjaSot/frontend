import type { Metadata } from "next";
import { BizOfferList } from "@/features/offers/BizOfferList";

export const metadata: Metadata = {
  title: "Fletushkat",
  robots: { index: false, follow: false },
};

export default function BizFlyersPage() {
  return <BizOfferList catalog="flyers" />;
}
