import type { Metadata } from "next";
import { AdminExclusive } from "@/features/admin/AdminExclusive";

export const metadata: Metadata = {
  title: "Kryefaqja",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return <AdminExclusive />;
}
