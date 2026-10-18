import type { Metadata } from "next";
import { AdminCreateBundle } from "@/features/admin/AdminCreateBundle";

export const metadata: Metadata = {
  title: "Fletushkë e re",
  robots: { index: false, follow: false },
};

export default async function AdminNewFlyersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminCreateBundle catalog="flyers" businessId={id} />;
}
