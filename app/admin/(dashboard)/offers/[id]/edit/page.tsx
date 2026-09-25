import type { Metadata } from "next";
import { AdminEditOfferScreen } from "@/features/admin/AdminEditOfferScreen";

export const metadata: Metadata = {
  title: "Ndrysho dosjen",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditOfferPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminEditOfferScreen id={id} />;
}
