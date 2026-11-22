import type { Metadata } from "next";
import { BizProfilePanel } from "@/features/biz/BizProfilePanel";
import { pageTitle } from "@/lib/ui";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Profili",
  robots: { index: false, follow: false },
};

export default function BizProfilePage() {
  return (
    <PageWidth variant="list">
      <h1 className={pageTitle}>Profili</h1>
      <BizProfilePanel />
    </PageWidth>
  );
}
