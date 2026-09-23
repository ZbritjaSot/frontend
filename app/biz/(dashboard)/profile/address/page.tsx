import type { Metadata } from "next";
import { BizAddressScreen } from "@/features/biz/BizAddressScreen";
import { pageTitle } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Adresa",
  robots: { index: false, follow: false },
};

export default function BizAddressPage() {
  return (
    <>
      <h1 className={pageTitle}>Adresa</h1>
      <BizAddressScreen />
    </>
  );
}
