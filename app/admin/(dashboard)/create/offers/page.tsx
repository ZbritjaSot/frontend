import type { Metadata } from "next";
import { AdminCreateBundle } from "@/features/admin/AdminCreateBundle";

export const metadata: Metadata = {
  title: "Oferta të reja",
  robots: { index: false, follow: false },
};

export default function AdminCreateOffersPage() {
  return <AdminCreateBundle catalog="offers" />;
}
