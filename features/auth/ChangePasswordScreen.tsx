"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { changePassword } from "@/features/auth/api";
import { meQueryKey } from "@/hooks/useAuth";
import { validationMessage } from "@/lib/api";
import { btnPrimary, fieldError, fieldLabel, inputClass } from "@/lib/ui";

export function ChangePasswordScreen() {
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState("");
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
    if (password === currentPassword) {
      setError("Fjalëkalimi i ri duhet të jetë i ndryshëm.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const user = await changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: confirmation,
      });
      queryClient.setQueryData(meQueryKey, user);
    } catch (submitError) {
      setError(
        validationMessage(submitError, "Nuk mundëm ta ndryshojmë fjalëkalimin."),
      );
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
        Fjalëkalimi nga email-i duhet ndërruar para se të hapet paneli.
      </p>
      {error ? (
        <p className={fieldError} role="alert">
          {error}
        </p>
      ) : null}
      <label className={fieldLabel}>
        <span>Fjalëkalimi nga email-i</span>
        <input
          className={inputClass}
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </label>
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
      </form>
    </main>
  );
}
