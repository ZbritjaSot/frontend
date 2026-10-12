import type { Metadata } from "next";
import { AdminPasswordScreen } from "@/features/admin/AdminPasswordScreen";

export const metadata: Metadata = {
  title: "Fjalëkalimi",
  robots: { index: false, follow: false },
};

export default function AdminProfilePasswordPage() {
  return <AdminPasswordScreen />;
}
