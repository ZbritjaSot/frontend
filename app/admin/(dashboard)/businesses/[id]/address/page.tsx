import type { Metadata } from "next";
import { AdminBusinessAddress } from "@/features/admin/AdminBusinessAddress";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Adresa",
  robots: { index: false, follow: false },
};

export default async function AdminBusinessAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageWidth variant="form"><AdminBusinessAddress id={id} /></PageWidth>;
}
