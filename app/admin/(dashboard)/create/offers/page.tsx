import type { Metadata } from "next";
import { AdminCreateBundle } from "@/features/admin/AdminCreateBundle";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Oferta të reja",
  robots: { index: false, follow: false },
};

export default function AdminCreateOffersPage() {
  return <PageWidth variant="form"><AdminCreateBundle catalog="offers" /></PageWidth>;
}
