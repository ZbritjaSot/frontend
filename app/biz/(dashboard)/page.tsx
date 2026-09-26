import type { Metadata } from "next";
import { BizHomeGate } from "@/features/biz/BizHomeGate";

export const metadata: Metadata = {
  title: "Biznes",
  robots: { index: false, follow: false },
};

export default function BizHomePage() {
  return <BizHomeGate />;
}
