import type { Metadata } from "next";
import { InspectOfferScreen } from "@/features/admin/InspectOfferScreen";

export const metadata: Metadata = {
  title: "Shiko dosjen",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminInspectOfferPage({ params }: PageProps) {
  const { id } = await params;
  return <InspectOfferScreen id={id} />;
}
