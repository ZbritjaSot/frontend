import { Suspense } from "react";
import type { Metadata } from "next";
import { Spinner } from "@/components/ui/Spinner";
import { AdminEditOfferScreen } from "@/features/admin/AdminEditOfferScreen";

export const metadata: Metadata = {
  title: "Ndrysho fletushkën",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditOfferPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<Spinner label="Duke ngarkuar fletushkën" />}>
      <AdminEditOfferScreen id={id} />
    </Suspense>
  );
}
