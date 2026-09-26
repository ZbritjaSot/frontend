import type { Metadata } from "next";
import { AdminBusinessAddress } from "@/features/admin/AdminBusinessAddress";

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
  return <AdminBusinessAddress id={id} />;
}
