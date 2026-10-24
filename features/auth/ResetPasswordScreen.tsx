"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { Spinner } from "@/components/ui/Spinner";
import { resetPassword } from "@/features/auth/api";
import { btnPrimary, fieldError, fieldLabel, inputClass } from "@/lib/ui";
import { resetPasswordSchema } from "@/schemas/passwordReset";

export function ResetPasswordScreen() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const linkReady = email !== "" && token !== "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = resetPasswordSchema.safeParse({
      password,
      password_confirmation: confirmation,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Fjalëkalimi nuk është i vlefshëm.");
      return;
    }

    setPending(true);
    try {
      await resetPassword({
        email,
        token,
        password: parsed.data.password,
        password_confirmation: parsed.data.password_confirmation,
      });
      setSaved(true);
    } catch {
      setError("Ky email nuk vlen më. Kërko një të ri.");
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
        <p className="m-0 mt-3 mb-8 text-xl font-semibold">Fjalëkalim i ri</p>

        {saved ? (
          <p className="m-0 text-sm leading-relaxed text-muted">
            Fjalëkalimi u ruajt. Hyr me të riun.
          </p>
        ) : !linkReady ? (
          <p className="m-0 text-sm leading-relaxed text-muted">
            Ky email nuk është i plotë. Kërko një të ri nga hyrja.
          </p>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
            <label className={fieldLabel}>
              <span>Fjalëkalimi i ri</span>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pending}
                required
              />
            </label>
            <label className={fieldLabel}>
              <span>Përsërit fjalëkalimin</span>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
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
                <Spinner label="Duke u ruajtur" size="sm" block={false} tone="onAccent" />
              ) : (
                "Ruaj fjalëkalimin"
              )}
            </button>
          </form>
        )}

        <Link
          href={saved ? "/login" : "/biz/forgot-password"}
          className="mt-8 inline-flex text-sm font-semibold text-muted hover:text-accent"
        >
          {saved ? "Hyr" : "Kërko email të ri"}
        </Link>
      </div>
    </main>
  );
}
