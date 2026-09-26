"use client";

import { useState, type FormEvent } from "react";
import { apiFetch, validationMessage } from "@/lib/api";

const field =
  "min-w-0 w-full border border-ivory/20 bg-black/30 text-sm font-medium text-ivory outline-none placeholder:text-ivory/40 transition-[border-color,box-shadow] duration-150 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60 dark:border-white/15 dark:text-ink dark:placeholder:text-muted";

const submit =
  "inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-accent font-bold text-charcoal transition-[filter] duration-150 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-65";

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function NewsletterSignup({ variant }: { variant: "footer" | "home" }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (trimmed === "") {
      setError("Shkruaj email-in.");
      return;
    }
    if (!emailPattern.test(trimmed)) {
      setError("Shkruaj një email të vlefshëm.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await apiFetch("/newsletter", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ email: trimmed }),
      });
      setDone(true);
      setEmail("");
    } catch (caught) {
      setError(validationMessage(caught, "Nuk mundëm të të regjistrojmë."));
    } finally {
      setPending(false);
    }
  };

  const compact = variant === "footer";

  return (
    <form
      className={compact ? "flex flex-wrap items-center gap-x-3 gap-y-2" : "grid gap-2.5"}
      onSubmit={onSubmit}
      noValidate
    >
      {compact && !done ? (
        <p className="m-0 text-sm font-bold tracking-[-0.02em] text-ivory dark:text-ink">
          ZbritjaSot në inbox
        </p>
      ) : null}
      {done ? (
        <p className="m-0 text-sm leading-relaxed font-semibold text-accent">
          U regjistrove.
          {compact ? null : (
            <span className="font-medium text-ivory/80 dark:text-muted">
              {" "}
              Do të marrësh ofertat më të mira të ZbritjaSot në inbox.
            </span>
          )}
        </p>
      ) : (
        <div
          className={
            compact
              ? "flex w-full min-w-0 items-center gap-2 sm:w-auto sm:max-w-sm"
              : "flex flex-col gap-2 sm:flex-row sm:items-center"
          }
        >
          <label className={compact ? "min-w-0 flex-1 sm:w-52 sm:flex-none" : "min-w-0 flex-1"}>
            <span className="sr-only">Email</span>
            <input
              className={`${field} ${compact ? "h-9 rounded-lg px-3" : "h-11 rounded-xl px-3.5"}`}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="email@shembull.com"
              value={email}
              maxLength={255}
              disabled={pending}
              aria-invalid={error ? true : undefined}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button
            className={`${submit} ${compact ? "h-9 rounded-lg px-3 text-sm" : "h-11 rounded-xl px-4 text-sm"}`}
            type="submit"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Duke u regjistruar…" : "Abonohu"}
          </button>
        </div>
      )}
      {error ? (
        <p className="m-0 w-full text-sm font-semibold text-[#ffb4b4]" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
