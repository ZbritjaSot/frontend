"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { Spinner } from "@/components/ui/Spinner";
import { resetPassword } from "@/features/auth/api";
import { PasswordField } from "@/features/auth/PasswordField";
import { button, fieldError } from "@/lib/ui";
import { resetPasswordSchema } from "@/schemas/passwordReset";

export function ResetPasswordScreen() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<"password" | "confirmation" | "both" | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const errorId = useId();
  const linkReady = email !== "" && token !== "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInvalid(null);

    const parsed = resetPasswordSchema.safeParse({
      password,
      password_confirmation: confirmation,
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const key = issue?.path[0];
      setInvalid(
        key === "password"
          ? "password"
          : key === "password_confirmation" && confirmation !== ""
            ? "both"
            : "confirmation",
      );
      setError(issue?.message ?? "Fjalëkalimi nuk është i vlefshëm.");
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
      setInvalid("both");
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
          <Wordmark className="text-2xl" />
        </Link>

        <p className="m-0 text-kicker text-accent-fg uppercase">
          Biznes
        </p>
        <h1 className="m-0 mt-3 mb-8 text-xl font-semibold">Fjalëkalim i ri</h1>

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
            <PasswordField
              label="Fjalëkalimi i ri"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              disabled={pending}
              invalid={invalid === "password" || invalid === "both"}
              describedBy={
                invalid === "password" || invalid === "both" ? errorId : undefined
              }
            />
            <PasswordField
              label="Përsërit fjalëkalimin"
              autoComplete="new-password"
              value={confirmation}
              onChange={setConfirmation}
              disabled={pending}
              invalid={invalid === "confirmation" || invalid === "both"}
              describedBy={
                invalid === "confirmation" || invalid === "both" ? errorId : undefined
              }
            />
            {error ? (
              <p id={errorId} className={fieldError} role="alert">
                {error}
              </p>
            ) : null}
            <button className={`${button()} w-full`} type="submit" disabled={pending}>
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
          className="mt-8 inline-flex text-sm font-semibold text-muted hover:text-accent-fg"
        >
          {saved ? "Hyr" : "Kërko email të ri"}
        </Link>
      </div>
    </main>
  );
}
