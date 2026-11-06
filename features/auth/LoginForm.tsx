"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/Spinner";
import { loginWithCookies, logout } from "@/features/auth/api";
import { hasDashboardRole, postLoginPath } from "@/features/auth/postLoginPath";
import { meQueryKey } from "@/hooks/useAuth";
import { validationMessage } from "@/lib/api";
import { button, fieldError, fieldLabel, input } from "@/lib/ui";
import { loginSchema } from "@/schemas/login";

type LoginFormProps = {
  next?: string | null;
  forgotHref?: string;
};

export function LoginForm({ next, forgotHref }: LoginFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Të dhënat nuk janë të vlefshme.");
      return;
    }

    setPending(true);
    try {
      const user = await loginWithCookies(parsed.data);

      if (!hasDashboardRole(user)) {
        try {
          await logout();
        } catch {
          // Best-effort; still clear local auth state below.
        }
        queryClient.setQueryData(meQueryKey, null);
        await queryClient.invalidateQueries({ queryKey: meQueryKey });
        setError("Kjo llogari nuk ka qasje.");
        return;
      }

      queryClient.setQueryData(meQueryKey, user);
      router.replace(postLoginPath(user, next));
    } catch (err) {
      setError(validationMessage(err, "Email ose fjalëkalim i pasaktë."));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <label className={fieldLabel}>
        <span>Email</span>
        <input
          className={input()}
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          required
        />
      </label>

      <label className={fieldLabel}>
        <span>Fjalëkalimi</span>
        <input
          className={input()}
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          required
        />
      </label>

      {forgotHref ? (
        <Link
          href={forgotHref}
          className="-mt-2 self-start text-sm font-semibold text-muted hover:text-accent-fg"
        >
          Ke harruar fjalëkalimin?
        </Link>
      ) : null}

      {error ? (
        <p className={fieldError} role="alert">
          {error}
        </p>
      ) : null}

      <button className={`${button()} w-full`} type="submit" disabled={pending}>
        {pending ? (
          <Spinner
            label="Duke u futur"
            size="sm"
            block={false}
            tone="onAccent"
          />
        ) : (
          "Hyr"
        )}
      </button>
    </form>
  );
}
