"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowBackIcon } from "@/components/ui/icons";
import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { LoginForm } from "@/features/auth/LoginForm";
import { postLoginPath } from "@/features/auth/postLoginPath";
import { useMe } from "@/hooks/useAuth";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { data: user, isLoading, isFetching } = useMe();

  useEffect(() => {
    if (isLoading || isFetching || !user) {
      return;
    }

    router.replace(postLoginPath(user, next));
  }, [user, isLoading, isFetching, router, next]);

  return (
    <main className="flex min-h-dvh items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-14 flex items-center gap-3">
          <Link href="/" aria-hidden tabIndex={-1}>
            <LogoMark size={40} priority />
          </Link>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link href="/" aria-label="ZbritjaSot">
              <Wordmark className="text-2xl" />
            </Link>
            <h1 className="m-0 text-kicker text-accent-fg uppercase">Hyr</h1>
          </div>
        </div>

        <LoginForm next={next} forgotHref="/biz/forgot-password" />

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-accent-fg"
        >
          <ArrowBackIcon fontSize="small" />
          Faqja publike
        </Link>
      </div>
    </main>
  );
}
