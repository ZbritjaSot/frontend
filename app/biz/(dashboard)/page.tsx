import type { Metadata } from "next";
import { BizHomePanel } from "@/features/biz/BizHomePanel";

export const metadata: Metadata = {
  title: "Biznes",
  robots: { index: false, follow: false },
};

export default function BizHomePage() {
  return <BizHomePanel />;
}
