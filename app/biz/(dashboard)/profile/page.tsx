import type { Metadata } from "next";
import { BizProfilePanel } from "@/features/biz/BizProfilePanel";
import { pageTitle } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Profili",
  robots: { index: false, follow: false },
};

export default function BizProfilePage() {
  return (
    <>
      <h1 className={pageTitle}>Profili</h1>
      <BizProfilePanel />
    </>
  );
}
