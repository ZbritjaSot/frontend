import type { Metadata } from "next";
import { AdminHomePanel } from "@/features/admin/AdminHomePanel";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return <PageWidth variant="wide"><AdminHomePanel /></PageWidth>;
}
