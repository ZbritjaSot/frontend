import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
  if (params.adrese) {
    redirect(`/admin/businesses/${params.adrese}`);
  }
  return <AdminBusinesses />;
}
