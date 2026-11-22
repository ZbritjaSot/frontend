import type { Metadata } from "next";
import { AdminCreateBundle } from "@/features/admin/AdminCreateBundle";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Fletushkë e re",
  robots: { index: false, follow: false },
};

export default function AdminCreateFlyersPage() {
  return <PageWidth variant="form"><AdminCreateBundle catalog="flyers" /></PageWidth>;
}
