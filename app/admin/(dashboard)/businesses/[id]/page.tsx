import type { Metadata } from "next";
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
  return <AdminBusinessProfile id={id} />;
}
