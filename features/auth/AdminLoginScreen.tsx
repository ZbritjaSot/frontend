"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { LoginForm } from "@/features/auth/LoginForm";
import {
  requireAdminUser,
  requireBusinessUser,
  useMe,
} from "@/hooks/useAuth";

export function AdminLoginScreen() {
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useMe();

  useEffect(() => {
    if (isLoading || isFetching || !user) {
      return;
    }

    if (requireAdminUser(user)) {
      router.replace("/admin");
      return;
    }

    if (requireBusinessUser(user)) {
      router.replace("/biz");
    }
  }, [user, isLoading, isFetching, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-14 inline-flex items-center gap-3"
          aria-label="ZbritjaSot"
        >
          <LogoMark size={40} priority />
          <Wordmark className="text-2xl" as="h1" />
        </Link>

        <p className="m-0 text-xs font-bold tracking-[0.2em] text-accent uppercase">
          Admin
        </p>
        <p className="m-0 mt-3 mb-8 text-xl font-semibold">
          Hyr në panelin e administratorit
        </p>

        <LoginForm
          requiredRole="admin"
          nextPath="/admin"
          wrongRoleMessage="Kjo llogari nuk është llogari admini."
        />

        <p className="m-0 mt-8 text-[0.8125rem] leading-normal text-muted [&_code]:font-mono [&_code]:text-xs [&_code]:text-accent">
          Demo: <code>admin@zbritjasot.com</code> / <code>password</code>
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-accent"
        >
          <ArrowBackIcon fontSize="small" />
          Faqja publike
        </Link>
      </div>
    </main>
  );
}
