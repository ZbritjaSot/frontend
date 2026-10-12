import { Suspense } from "react";
import type { Metadata } from "next";
import { BizLoginScreen } from "@/features/auth/BizLoginScreen";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Hyrje · Biznes",
  robots: { index: false, follow: false },
};

export default function BizLoginPage() {
  return (
    <Suspense fallback={<Spinner label="Duke ngarkuar" />}>
      <BizLoginScreen />
    </Suspense>
  );
}
