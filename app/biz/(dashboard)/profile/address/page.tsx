import type { Metadata } from "next";
import { BizAddressScreen } from "@/features/biz/BizAddressScreen";

export const metadata: Metadata = {
  title: "Adresa",
  robots: { index: false, follow: false },
};

export default function BizAddressPage() {
  return (
    <>
      <h1 className="dash__page-title">Adresa</h1>
      <BizAddressScreen />
    </>
  );
}
