import type { Metadata } from "next";
import { BizPasswordScreen } from "@/features/biz/BizPasswordScreen";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Fjalëkalimi",
  robots: { index: false, follow: false },
};

export default function BizPasswordPage() {
  return <PageWidth variant="form"><BizPasswordScreen /></PageWidth>;
}
