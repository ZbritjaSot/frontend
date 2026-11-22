import type { Metadata } from "next";
import { AdminExclusive } from "@/features/admin/AdminExclusive";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Kryefaqja",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return <PageWidth variant="wide"><AdminExclusive /></PageWidth>;
}
