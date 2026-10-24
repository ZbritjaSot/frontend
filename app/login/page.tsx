import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginScreen } from "@/features/auth/LoginScreen";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner label="Duke ngarkuar" />}>
      <LoginScreen />
    </Suspense>
  );
}
