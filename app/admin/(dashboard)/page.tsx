import type { Metadata } from "next";
import { AdminHomePanel } from "@/features/admin/AdminHomePanel";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return <AdminHomePanel />;
}
