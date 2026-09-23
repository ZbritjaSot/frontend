import type { Metadata } from "next";
import { BizOfferList } from "@/features/offers/BizOfferList";
import { pageTitle } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Ofertat e mia",
  robots: { index: false, follow: false },
};

export default function BizOffersPage() {
  return (
    <>
      <h1 className={pageTitle}>Ofertat e mia</h1>
      <BizOfferList />
    </>
  );
}
