import type { Metadata } from "next";
import { AdminManagers } from "@/features/admin/AdminManagers";

export const metadata: Metadata = {
  title: "Menaxherët",
  robots: { index: false, follow: false },
};

export default function AdminManagersPage() {
  return <AdminManagers />;
}
