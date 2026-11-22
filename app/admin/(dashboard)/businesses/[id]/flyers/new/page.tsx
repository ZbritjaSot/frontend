import type { Metadata } from "next";
import { AdminCreateBundle } from "@/features/admin/AdminCreateBundle";
import { PageWidth } from "@/components/chrome/PageWidth";

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
  return <PageWidth variant="form"><AdminCreateBundle catalog="flyers" businessId={id} /></PageWidth>;
}
