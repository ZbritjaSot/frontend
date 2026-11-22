import type { Metadata } from "next";
import { ManagerShops } from "@/features/biz/ManagerShops";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Dyqanet",
  robots: { index: false, follow: false },
};

export default function ManagerShopsPage() {
  return <PageWidth variant="list"><ManagerShops /></PageWidth>;
}
