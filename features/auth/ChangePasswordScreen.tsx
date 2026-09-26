"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { changePassword } from "@/features/auth/api";
import { LogoutButton } from "@/features/auth/LogoutButton";
import { meQueryKey } from "@/hooks/useAuth";
import { validationMessage } from "@/lib/api";
import { btnPrimary, fieldError, fieldLabel, inputClass } from "@/lib/ui";

function passwordError(error: unknown): string {
  const message = validationMessage(
    error,
    "Nuk mundëm ta ndryshojmë fjalëkalimin.",
  );

  if (message === "The new password must be different.") {
    return "Fjalëkalimi i ri duhet të jetë i ndryshëm.";
  }

  return message;
}

export function ChangePasswordScreen() {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere.");
      return;
    }
    if (password !== confirmation) {
      setError("Fjalëkalimet nuk përputhen.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const user = await changePassword({
        password,
        password_confirmation: confirmation,
      });
      queryClient.setQueryData(meQueryKey, user);
    } catch (submitError) {
      setError(passwordError(submitError));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-8">
      <form
        className="flex w-full max-w-sm flex-col gap-5"
        onSubmit={onSubmit}
        noValidate
      >
        <p className="m-0 text-xs font-bold tracking-[0.2em] text-accent uppercase">
          Biznes
        </p>
        <h1 className="m-0 text-xl font-semibold">Ndrysho fjalëkalimin</h1>
        <p className="m-0 text-sm leading-relaxed text-muted">
          Fjalëkalimi nga email-i duhet ndërruar para se të hapet paneli. Nëse
          del tani, hyrja tjetër të kthen te kjo faqe.
        </p>
        {error ? (
          <p className={fieldError} role="alert">
            {error}
          </p>
        ) : null}
        <label className={fieldLabel}>
          <span>Fjalëkalimi i ri</span>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className={fieldLabel}>
          <span>Përsërit fjalëkalimin e ri</span>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        <button className={btnPrimary} type="submit" disabled={pending}>
          {pending ? "Duke u ruajtur…" : "Ruaj fjalëkalimin"}
        </button>
        <LogoutButton redirectTo="/biz/login" />
      </form>
    </main>
  );
}
