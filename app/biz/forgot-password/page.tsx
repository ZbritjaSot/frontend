import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/features/auth/ForgotPasswordScreen";

export const metadata: Metadata = {
  title: "Fjalëkalimi i harruar · Biznes",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
