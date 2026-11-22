import type { Metadata } from "next";
import { ViewOfferScreen } from "@/features/offers/ViewOfferScreen";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Oferta",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ViewBizOfferPage({ params }: PageProps) {
  const { id } = await params;
  return <PageWidth variant="list"><ViewOfferScreen id={id} catalog="offers" /></PageWidth>;
}
