import type { Metadata } from "next";
import { BizAddressScreen } from "@/features/biz/BizAddressScreen";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Adresa",
  robots: { index: false, follow: false },
};

export default function BizAddressPage() {
  return <PageWidth variant="form"><BizAddressScreen /></PageWidth>;
}
