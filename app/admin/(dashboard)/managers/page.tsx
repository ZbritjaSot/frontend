import type { Metadata } from "next";
import { AdminManagers } from "@/features/admin/AdminManagers";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Menaxherët",
  robots: { index: false, follow: false },
};

export default function AdminManagersPage() {
  return <PageWidth variant="list"><AdminManagers /></PageWidth>;
}
