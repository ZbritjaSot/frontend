import type { Metadata } from "next";
import { AdminBusinesses } from "@/features/admin/AdminBusinesses";

export const metadata: Metadata = {
  title: "Bizneset",
  robots: { index: false, follow: false },
};

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ adrese?: string }>;
}) {
  const params = await searchParams;
  return <AdminBusinesses addressId={params.adrese} />;
}
