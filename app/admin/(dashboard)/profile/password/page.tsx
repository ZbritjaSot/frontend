import type { Metadata } from "next";
import { AdminPasswordScreen } from "@/features/admin/AdminPasswordScreen";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Fjalëkalimi",
  robots: { index: false, follow: false },
};

export default function AdminProfilePasswordPage() {
  return <PageWidth variant="form"><AdminPasswordScreen /></PageWidth>;
}
