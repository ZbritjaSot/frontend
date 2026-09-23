"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { changePassword } from "@/features/auth/api";
import { meQueryKey } from "@/hooks/useAuth";
import { validationMessage } from "@/lib/api";

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
    <form className="offer-form" onSubmit={onSubmit} noValidate>
      <h2 className="offer-form__title">Ndrysho fjalëkalimin</h2>
      <p className="biz-offers__hint">
        Ky është hyrja e parë. Fjalëkalimi nga email-i duhet ndërruar para se të
        vazhdosh.
      </p>
      {error ? (
        <p className="offer-form__error" role="alert">
          {error}
        </p>
      ) : null}
      <label className="offer-form__field">
        <span>Fjalëkalimi nga email-i</span>
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </label>
      <label className="offer-form__field">
        <span>Fjalëkalimi i ri</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className="offer-form__field">
        <span>Përsërit fjalëkalimin e ri</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </label>
      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? "Duke u ruajtur…" : "Ruaj fjalëkalimin"}
      </button>
    </form>
  );
}
