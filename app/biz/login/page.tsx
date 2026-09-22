import type { Metadata } from "next";
import { BizLoginScreen } from "@/features/auth/BizLoginScreen";

export const metadata: Metadata = {
  title: "Hyrje · Biznes",
  robots: { index: false, follow: false },
};

export default function BizLoginPage() {
  return <BizLoginScreen />;
}
