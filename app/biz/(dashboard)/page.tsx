import type { Metadata } from "next";
import { BizHomeGate } from "@/features/biz/BizHomeGate";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Biznes",
  robots: { index: false, follow: false },
};

export default function BizHomePage() {
  return <PageWidth variant="wide"><BizHomeGate /></PageWidth>;
}
