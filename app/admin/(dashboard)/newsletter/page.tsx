import type { Metadata } from "next";
import { AdminNewsletter } from "@/features/admin/AdminNewsletter";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Buletini",
  robots: { index: false, follow: false },
};

export default function AdminNewsletterPage() {
  return <PageWidth variant="wide"><AdminNewsletter /></PageWidth>;
}
