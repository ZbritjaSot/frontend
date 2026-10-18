import type { Metadata } from "next";
import { AdminCreateBundle } from "@/features/admin/AdminCreateBundle";

export const metadata: Metadata = {
  title: "Fletushkë e re",
  robots: { index: false, follow: false },
};

export default function AdminCreateFlyersPage() {
  return <AdminCreateBundle catalog="flyers" />;
}
