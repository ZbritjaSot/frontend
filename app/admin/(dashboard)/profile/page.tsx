import type { Metadata } from "next";
import { AdminProfilePanel } from "@/features/admin/AdminProfilePanel";
import { pageTitle } from "@/lib/ui";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Profili",
  robots: { index: false, follow: false },
};

export default function AdminProfilePage() {
  return (
    <PageWidth variant="form">
      <h1 className={pageTitle}>Profili</h1>
      <AdminProfilePanel />
    </PageWidth>
  );
}
