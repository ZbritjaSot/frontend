import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordScreen } from "@/features/auth/ResetPasswordScreen";

export const metadata: Metadata = {
  title: "Fjalëkalim i ri · Biznes",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  );
}
