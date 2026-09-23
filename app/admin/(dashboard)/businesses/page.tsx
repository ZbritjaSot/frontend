import type { Metadata } from "next";
import { AdminBusinesses } from "@/features/admin/AdminBusinesses";

export const metadata: Metadata = {
  title: "Bizneset",
  robots: { index: false, follow: false },
};

export default function AdminBusinessesPage() {
  return <AdminBusinesses />;
}
