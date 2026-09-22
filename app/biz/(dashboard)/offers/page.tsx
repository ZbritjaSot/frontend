import type { Metadata } from "next";
import { BizOfferList } from "@/features/offers/BizOfferList";

export const metadata: Metadata = {
  title: "Ofertat e mia",
  robots: { index: false, follow: false },
};

export default function BizOffersPage() {
  return (
    <>
      <h1 className="dash__page-title">Ofertat e mia</h1>
      <BizOfferList />
    </>
  );
}
