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
          Biznes
        </p>
        <p className="m-0 mt-3 mb-8 text-xl font-semibold">
          Hyr në panelin e dyqanit
        </p>

        <LoginForm
          requiredRole={["business", "manager"]}
          nextPath="/biz"
          wrongRoleMessage="Kjo llogari nuk është llogari biznesi."
          forgotHref="/biz/forgot-password"
        />

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
