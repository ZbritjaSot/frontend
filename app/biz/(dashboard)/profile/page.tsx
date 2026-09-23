import type { Metadata } from "next";
import { BizProfilePanel } from "@/features/biz/BizProfilePanel";

export const metadata: Metadata = {
  title: "Profili",
  robots: { index: false, follow: false },
};

export default function BizProfilePage() {
  return (
    <>
      <h1 className="dash__page-title">Profili</h1>
      <BizProfilePanel />
    </>
  );
}
