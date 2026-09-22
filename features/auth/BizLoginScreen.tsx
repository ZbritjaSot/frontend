"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BizLoginForm } from "@/features/auth/BizLoginForm";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import Link from "next/link";
import { requireBusinessUser, useMe } from "@/hooks/useAuth";

export function BizLoginScreen() {
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useMe();

  useEffect(() => {
    if (!isLoading && !isFetching && requireBusinessUser(user)) {
      router.replace("/biz");
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

        <BizLoginForm />

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
