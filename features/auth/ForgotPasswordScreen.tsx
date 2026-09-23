"use client";

import { useState, type FormEvent } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { Spinner } from "@/components/ui/Spinner";
import { requestPasswordReset } from "@/features/auth/api";
import { btnPrimary, fieldError, fieldLabel, inputClass } from "@/lib/ui";
import { forgotPasswordSchema } from "@/schemas/passwordReset";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email-i nuk është i vlefshëm.");
      return;
    }

    setPending(true);
    try {
      await requestPasswordReset(parsed.data.email);
      setSent(true);
    } catch {
      setError("Nuk u dërgua. Provo përsëri.");
    } finally {
      setPending(false);
    }
  }

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
          Ke harruar fjalëkalimin?
        </p>

        {sent ? (
          <p className="m-0 text-sm leading-relaxed text-muted">
            Nëse kjo llogari ekziston, të dërguam një email. Hapeni brenda 60
            minutave dhe zgjidh fjalëkalimin e ri.
          </p>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
            <p className="m-0 text-sm leading-relaxed text-muted">
              Shkruaj email-in e llogarisë. Nëse ekziston, të dërgojmë një
              email për të zgjedhur fjalëkalimin e ri.
            </p>
            <label className={fieldLabel}>
              <span>Email</span>
              <input
                className={inputClass}
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={pending}
                required
              />
            </label>
            {error ? (
              <p className={fieldError} role="alert">
                {error}
              </p>
            ) : null}
            <button className={`${btnPrimary} w-full`} type="submit" disabled={pending}>
              {pending ? (
                <Spinner label="Duke u dërguar" size="sm" block={false} tone="onAccent" />
              ) : (
                "Dërgo email-in"
              )}
            </button>
          </form>
        )}

        <Link
          href="/biz/login"
          className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-accent"
        >
          <ArrowBackIcon fontSize="small" />
          Kthehu te hyrja
        </Link>
      </div>
    </main>
  );
}
