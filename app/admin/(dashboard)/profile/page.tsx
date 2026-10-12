import type { Metadata } from "next";
import { AdminProfilePanel } from "@/features/admin/AdminProfilePanel";
import { pageTitle } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Profili",
  robots: { index: false, follow: false },
};

export default function AdminProfilePage() {
  return (
    <>
      <h1 className={pageTitle}>Profili</h1>
      <AdminProfilePanel />
    </>
  );
}
