import { Suspense } from "react";
import type { Metadata } from "next";
import { Spinner } from "@/components/ui/Spinner";
import { AdminBusinessProfile } from "@/features/admin/AdminBusinessProfile";

export const metadata: Metadata = {
  title: "Profili",
  robots: { index: false, follow: false },
};

export default async function AdminBusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<Spinner label="Duke ngarkuar profilin" />}>
      <AdminBusinessProfile id={id} />
    </Suspense>
  );
}
