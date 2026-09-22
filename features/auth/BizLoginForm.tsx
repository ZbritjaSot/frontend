"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { hasRole, loginWithCookies } from "@/features/auth/api";
import { meQueryKey } from "@/hooks/useAuth";
import { validationMessage } from "@/lib/api";
import { loginSchema } from "@/schemas/login";

type BizLoginFormProps = {
  nextPath?: string;
};

export function BizLoginForm({ nextPath = "/biz" }: BizLoginFormProps) {
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

      if (!hasRole(user, "business")) {
        setError("Kjo llogari nuk është llogari biznesi.");
        return;
      }

      queryClient.setQueryData(meQueryKey, user);
      router.replace(nextPath);
    } catch (err) {
      setError(
        validationMessage(err, "Email ose fjalëkalim i pasaktë."),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <label className="auth-form__field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          required
        />
      </label>

      <label className="auth-form__field">
        <span>Fjalëkalimi</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          required
        />
      </label>

      {error ? (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="auth-form__submit" type="submit" disabled={pending}>
        {pending ? "Duke u futur…" : "Hyr"}
      </button>
    </form>
  );
}
