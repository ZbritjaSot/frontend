import { Suspense } from "react";
import type { Metadata } from "next";
import { Spinner } from "@/components/ui/Spinner";
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
  return (
    <Suspense fallback={<Spinner label="Duke ngarkuar dosjen" />}>
      <InspectOfferScreen id={id} />
    </Suspense>
  );
}
