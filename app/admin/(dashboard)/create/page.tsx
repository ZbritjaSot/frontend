import type { Metadata } from "next";
import { AdminAddContent } from "@/features/admin/AdminAddContent";

export const metadata: Metadata = {
  title: "Shto përmbajtje",
  robots: { index: false, follow: false },
};

export default function AdminCreatePage() {
  return <AdminAddContent />;
}
