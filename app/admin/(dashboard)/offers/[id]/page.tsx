import { Suspense } from "react";
import type { Metadata } from "next";
import { Spinner } from "@/components/ui/Spinner";
import { InspectOfferScreen } from "@/features/admin/InspectOfferScreen";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Shiko fletushkën",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminInspectOfferPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <PageWidth variant="list">
      <Suspense fallback={<Spinner label="Duke ngarkuar fletushkën" />}>
        <InspectOfferScreen id={id} />
      </Suspense>
    </PageWidth>
  );
}
