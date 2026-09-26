"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { changePassword, hasRole } from "@/features/auth/api";
import { useMe } from "@/hooks/useAuth";
import { validationMessage } from "@/lib/api";
import {
  btnPrimary,
  fieldError,
  fieldLabel,
  inputClass,
  pageTitle,
} from "@/lib/ui";

function passwordError(error: unknown): string {
  const message = validationMessage(
    error,
    "Nuk mundëm ta ndryshojmë fjalëkalimin.",
  );

  if (message === "The current password is incorrect.") {
    return "Fjalëkalimi aktual nuk është i saktë.";
  }

  return message;
}

export function BizPasswordScreen() {
  const router = useRouter();
  const { data: user } = useMe();
  const manager = !!user && hasRole(user, "manager");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (manager) {
      router.replace("/biz");
    }
  }, [manager, router]);

  if (manager) {
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);

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
      await changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: confirmation,
      });
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
          href="/biz/profile"
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
        <label className={fieldLabel}>
          <span>Fjalëkalimi aktual</span>
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            disabled={pending}
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
            disabled={pending}
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
