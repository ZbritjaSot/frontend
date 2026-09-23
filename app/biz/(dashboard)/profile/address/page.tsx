import type { Metadata } from "next";
import { BizAddressScreen } from "@/features/biz/BizAddressScreen";

export const metadata: Metadata = {
  title: "Adresa",
  robots: { index: false, follow: false },
};

export default function BizAddressPage() {
  return <BizAddressScreen />;
}
