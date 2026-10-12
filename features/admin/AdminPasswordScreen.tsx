"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { changePassword } from "@/features/auth/api";
import { meQueryKey } from "@/hooks/useAuth";
import { passwordError, validateNewPassword } from "@/lib/passwordErrors";
import {
  btnPrimary,
  fieldError,
  fieldLabel,
  inputClass,
  pageTitle,
} from "@/lib/ui";

export function AdminPasswordScreen() {
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);

    const localError = validateNewPassword(password, confirmation);
    if (localError) {
      setError(localError);
      return;
    }
    if (password === currentPassword) {
      setError("Fjalëkalimi i ri duhet të jetë i ndryshëm.");
      return;
    }

    setError(null);
    setPending(true);
    try {
      const nextUser = await changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: confirmation,
      });
      queryClient.setQueryData(meQueryKey, nextUser);
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
      setSaved(true);
    } catch (submitError) {
      setError(passwordError(submitError));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
        <Link
          href="/admin/profile"
          className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Profili</span>
        </Link>
        <h1 className={`${pageTitle} col-start-2 mt-3 mb-0!`}>
          Ndrysho fjalëkalimin
        </h1>
      </div>

      <form
        className="flex max-w-md flex-col gap-5 rounded-2xl border border-line p-5"
        onSubmit={onSubmit}
        noValidate
      >
        {saved ? (
          <p className="m-0 text-sm font-semibold text-ink">
            Fjalëkalimi u ndryshua.
          </p>
        ) : null}
        {error ? (
          <p className={fieldError} role="alert">
            {error}
          </p>
        ) : null}
        <label className={fieldLabel} htmlFor="admin-current-password">
          <span>Fjalëkalimi aktual</span>
          <input
            id="admin-current-password"
            className={inputClass}
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            disabled={pending}
          />
        </label>
        <label className={fieldLabel} htmlFor="admin-new-password">
          <span>Fjalëkalimi i ri</span>
          <input
            id="admin-new-password"
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
          />
        </label>
        <label className={fieldLabel} htmlFor="admin-confirm-password">
          <span>Përsërit fjalëkalimin e ri</span>
          <input
            id="admin-confirm-password"
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={pending}
          />
        </label>
        <button className={`${btnPrimary} self-start`} type="submit" disabled={pending}>
          {pending ? "Duke u ruajtur…" : "Ruaj fjalëkalimin"}
        </button>
      </form>
    </div>
  );
}
