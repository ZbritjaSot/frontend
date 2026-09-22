import type { Metadata } from "next";
import { EditOfferScreen } from "@/features/offers/EditOfferScreen";

export const metadata: Metadata = {
  title: "Ndrysho ofertën",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBizOfferPage({ params }: PageProps) {
  const { id } = await params;
  return <EditOfferScreen id={id} />;
}
