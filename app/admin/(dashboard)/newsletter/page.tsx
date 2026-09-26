import type { Metadata } from "next";
import { AdminNewsletter } from "@/features/admin/AdminNewsletter";

export const metadata: Metadata = {
  title: "Newsletter",
  robots: { index: false, follow: false },
};

export default function AdminNewsletterPage() {
  return <AdminNewsletter />;
}
