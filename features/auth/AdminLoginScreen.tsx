"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { LoginForm } from "@/features/auth/LoginForm";
import { requireAdminUser, useMe } from "@/hooks/useAuth";

export function AdminLoginScreen() {
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useMe();

  useEffect(() => {
    if (!isLoading && !isFetching && requireAdminUser(user)) {
      router.replace("/admin");
    }
  }, [user, isLoading, isFetching, router]);

  return (
    <main className="auth-screen">
      <div className="auth-screen__panel">
        <Link href="/" className="auth-screen__brand" aria-label="ZbritjaSot">
          <LogoMark size={40} priority />
          <Wordmark className="auth-screen__wordmark" as="h1" />
        </Link>

        <p className="auth-screen__eyebrow">Admin</p>
        <p className="auth-screen__lead">Hyr në panelin e administratorit</p>

        <LoginForm
          requiredRole="admin"
          nextPath="/admin"
          wrongRoleMessage="Kjo llogari nuk është llogari admini."
        />

        <p className="auth-screen__hint">
          Demo: <code>admin@zbritjasot.com</code> / <code>password</code>
        </p>

        <Link href="/" className="auth-screen__back">
          ← Faqja publike
        </Link>
      </div>
    </main>
  );
}
