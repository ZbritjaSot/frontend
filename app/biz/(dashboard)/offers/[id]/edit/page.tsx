import type { Metadata } from "next";
import { EditOfferScreen } from "@/features/offers/EditOfferScreen";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Ndrysho ofertat",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBizOfferPage({ params }: PageProps) {
  const { id } = await params;
  return <PageWidth variant="form"><EditOfferScreen id={id} catalog="offers" /></PageWidth>;
}
