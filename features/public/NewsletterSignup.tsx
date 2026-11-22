"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { FieldError } from "@/components/ui/Field";
import { apiFetch, validationMessage } from "@/lib/api";
import { button, input } from "@/lib/ui";

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function NewsletterSignup({ variant }: { variant: "footer" | "home" }) {
  const errorId = useId();
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
        <p className="m-0 text-sm font-bold tracking-[-0.02em] text-ivory">
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
              className={input({ size: "md", shape: "pill", tone: "inverse" })}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="email@shembull.com"
              value={email}
              maxLength={255}
              disabled={pending}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button
            className={button({ size: "md", shape: "pill" })}
            type="submit"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Duke u regjistruar…" : "Abonohu"}
          </button>
        </div>
      )}
      {error ? (
        <div className="w-full" role="alert">
          <FieldError id={errorId} tone="inverse">
            {error}
          </FieldError>
        </div>
      ) : null}
      {done ? null : (
        <p className="m-0 w-full text-sm leading-relaxed text-ivory/75">
          Duke u abonuar pranon{" "}
          <Link
            href="/privatesia"
            className="font-semibold text-ivory underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            Privatësinë
          </Link>
        </p>
      )}
    </form>
  );
}
