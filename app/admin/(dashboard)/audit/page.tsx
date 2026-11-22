import type { Metadata } from "next";
import { AdminAudit } from "@/features/admin/AdminAudit";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Historiku",
  robots: { index: false, follow: false },
};

export default function AdminAuditPage() {
  return <PageWidth variant="list"><AdminAudit /></PageWidth>;
}
