import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminLoginScreen } from "@/features/auth/AdminLoginScreen";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Hyrje · Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<Spinner label="Duke ngarkuar" />}>
      <AdminLoginScreen />
    </Suspense>
  );
}
