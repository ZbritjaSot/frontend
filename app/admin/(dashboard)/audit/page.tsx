import type { Metadata } from "next";
import { AdminAudit } from "@/features/admin/AdminAudit";

export const metadata: Metadata = {
  title: "Regjistri",
  robots: { index: false, follow: false },
};

export default function AdminAuditPage() {
  return <AdminAudit />;
}
