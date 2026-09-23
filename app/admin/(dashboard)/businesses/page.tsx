import type { Metadata } from "next";
import { AdminBusinesses } from "@/features/admin/AdminBusinesses";
import { pageTitle } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Bizneset",
  robots: { index: false, follow: false },
};

export default function AdminBusinessesPage() {
  return (
    <>
      <h1 className={pageTitle}>Bizneset</h1>
      <AdminBusinesses />
    </>
  );
}
