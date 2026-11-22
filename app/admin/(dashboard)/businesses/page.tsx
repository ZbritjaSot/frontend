import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminBusinesses } from "@/features/admin/AdminBusinesses";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Bizneset",
  robots: { index: false, follow: false },
};

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ adrese?: string; scope?: string }>;
}) {
  const params = await searchParams;
  if (params.adrese) {
    redirect(`/admin/businesses/${params.adrese}`);
  }
  return <PageWidth variant="list"><AdminBusinesses initialScope={params.scope ?? ""} /></PageWidth>;
}
