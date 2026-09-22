"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { LoginForm } from "@/features/auth/LoginForm";
import {
  requireAdminUser,
  requireBusinessUser,
  useMe,
} from "@/hooks/useAuth";

export function BizLoginScreen() {
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useMe();

  useEffect(() => {
    if (isLoading || isFetching || !user) {
      return;
    }

    if (requireBusinessUser(user)) {
      router.replace("/biz");
      return;
    }

    if (requireAdminUser(user)) {
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

        <p className="auth-screen__eyebrow">Biznes</p>
        <p className="auth-screen__lead">Hyr në panelin e dyqanit</p>

        <LoginForm
          requiredRole="business"
          nextPath="/biz"
          wrongRoleMessage="Kjo llogari nuk është llogari biznesi."
        />

        <p className="auth-screen__hint">
          Demo: <code>kafe@demo.zbritjasot.com</code> / <code>password</code>
        </p>

        <Link href="/" className="auth-screen__back">
          ← Faqja publike
        </Link>
      </div>
    </main>
  );
}
