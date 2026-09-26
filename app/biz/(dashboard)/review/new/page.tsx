import type { Metadata } from "next";
import { ManagerCreateOffer } from "@/features/biz/ManagerCreateOffer";

export const metadata: Metadata = {
  title: "Dosje e re",
  robots: { index: false, follow: false },
};

export default function ManagerNewOfferPage() {
  return <ManagerCreateOffer />;
}
