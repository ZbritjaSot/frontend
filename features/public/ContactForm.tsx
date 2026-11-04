"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { InquirySuccess } from "@/features/public/inquiry/InquirySuccess";
import {
  inquiryError,
  inquiryForm,
  inquiryPanel,
} from "@/features/public/inquiry/styles";
import { apiFetch, validationMessage } from "@/lib/api";
import { button, input } from "@/lib/ui";

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

type FieldKey = "name" | "email" | "message";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const nextInvalid: Partial<Record<FieldKey, boolean>> = {};
    if (trimmedName === "") {
      nextInvalid.name = true;
      setInvalid(nextInvalid);
      setError("Shkruaj emrin.");
      return;
    }
    if (trimmedEmail === "") {
      nextInvalid.email = true;
      setInvalid(nextInvalid);
      setError("Shkruaj email-in.");
      return;
    }
    if (!emailPattern.test(trimmedEmail)) {
      nextInvalid.email = true;
      setInvalid(nextInvalid);
      setError("Shkruaj një email të vlefshëm.");
      return;
    }
    if (trimmedMessage === "") {
      nextInvalid.message = true;
      setInvalid(nextInvalid);
      setError("Shkruaj mesazhin.");
      return;
    }
    setInvalid({});
    setError(null);
    setPending(true);
    try {
      await apiFetch("/contact", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: phone.trim() || null,
          message: trimmedMessage,
        }),
      });
      setDone(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (caught) {
      setError(validationMessage(caught, "Nuk u dërgua. Provo përsëri."));
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <InquirySuccess
        title="Mesazhi u dërgua"
        body="Faleminderit që na shkrove. Do të kthehemi sa më shpejt që të mundemi."
      />
    );
  }

  return (
    <div className={inquiryPanel}>
      <form className={inquiryForm} onSubmit={onSubmit} noValidate>
        <Field id="contact-name" label="Emri" requirement="required">
          {(control) => (
            <input
              {...control}
              name="name"
              autoComplete="name"
              value={name}
              maxLength={120}
              disabled={pending}
              aria-invalid={invalid.name || undefined}
              placeholder="Emri yt"
              className={input({ size: "lg" })}
              onChange={(event) => {
                setName(event.target.value);
                setInvalid((prev) => ({ ...prev, name: false }));
              }}
            />
          )}
        </Field>
        <Field id="contact-email" label="Email" requirement="required">
          {(control) => (
            <input
              {...control}
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              maxLength={255}
              disabled={pending}
              aria-invalid={invalid.email || undefined}
              placeholder="email@shembull.com"
              className={input({ size: "lg" })}
              onChange={(event) => {
                setEmail(event.target.value);
                setInvalid((prev) => ({ ...prev, email: false }));
              }}
            />
          )}
        </Field>
        <Field id="contact-phone" label="Telefoni" requirement="optional">
          {(control) => (
            <input
              {...control}
              type="tel"
              name="phone"
              autoComplete="tel"
              value={phone}
              maxLength={40}
              disabled={pending}
              placeholder="p.sh. +383 44 000 000"
              className={input({ size: "lg" })}
              onChange={(event) => setPhone(event.target.value)}
            />
          )}
        </Field>
        <Field id="contact-message" label="Mesazhi" requirement="required">
          {(control) => (
            <textarea
              {...control}
              name="message"
              value={message}
              maxLength={5000}
              disabled={pending}
              aria-invalid={invalid.message || undefined}
              placeholder="Si mund të të ndihmojmë?"
              className={`${input({ size: "lg", multiline: true })} min-h-36 resize-y leading-relaxed`}
              onChange={(event) => {
                setMessage(event.target.value);
                setInvalid((prev) => ({ ...prev, message: false }));
              }}
            />
          )}
        </Field>
        {error ? (
          <p className={inquiryError} role="alert">
            {error}
          </p>
        ) : null}
        <div className="pt-1">
          <button
            className={`${button({ size: "lg", shape: "pill" })} w-full sm:w-auto sm:min-w-[11rem]`}
            type="submit"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? (
              <span className="inline-flex items-center gap-2.5">
                <Spinner label="Duke u dërguar" size="sm" block={false} tone="onAccent" />
                <span>Duke u dërguar…</span>
              </span>
            ) : (
              "Dërgo mesazhin"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
