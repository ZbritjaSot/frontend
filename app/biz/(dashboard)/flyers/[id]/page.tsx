import type { Metadata } from "next";
import { ViewOfferScreen } from "@/features/offers/ViewOfferScreen";

export const metadata: Metadata = {
  title: "Fletushka",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ViewBizFlyerPage({ params }: PageProps) {
  const { id } = await params;
  return <ViewOfferScreen id={id} catalog="flyers" />;
}
