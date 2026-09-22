import type { Metadata } from "next";
import { AdminLoginScreen } from "@/features/auth/AdminLoginScreen";

export const metadata: Metadata = {
  title: "Hyrje · Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginScreen />;
}
