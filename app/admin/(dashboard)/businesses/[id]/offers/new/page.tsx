import type { Metadata } from "next";
import { AdminCreateBundle } from "@/features/admin/AdminCreateBundle";

export const metadata: Metadata = {
  title: "Oferta të reja",
  robots: { index: false, follow: false },
};

export default async function AdminNewOffersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminCreateBundle catalog="offers" businessId={id} />;
}
