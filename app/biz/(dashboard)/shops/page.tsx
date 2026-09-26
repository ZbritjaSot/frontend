import type { Metadata } from "next";
import { ManagerShops } from "@/features/biz/ManagerShops";

export const metadata: Metadata = {
  title: "Dyqanet",
  robots: { index: false, follow: false },
};

export default function ManagerShopsPage() {
  return <ManagerShops />;
}
