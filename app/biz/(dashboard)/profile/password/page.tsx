import type { Metadata } from "next";
import { BizPasswordScreen } from "@/features/biz/BizPasswordScreen";

export const metadata: Metadata = {
  title: "Fjalëkalimi",
  robots: { index: false, follow: false },
};

export default function BizPasswordPage() {
  return <BizPasswordScreen />;
}
