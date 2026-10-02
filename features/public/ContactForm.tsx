"use client";

import { useState, type FormEvent } from "react";
import { apiFetch, validationMessage } from "@/lib/api";
import { btnPrimary, fieldError, fieldLabel, inputClass } from "@/lib/ui";

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

type ContactFormProps = {
  intro?: string;
};

export function ContactForm({ intro }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    if (trimmedName === "") {
      setError("Shkruaj emrin.");
      return;
    }
    if (trimmedEmail === "") {
      setError("Shkruaj email-in.");
      return;
    }
    if (!emailPattern.test(trimmedEmail)) {
      setError("Shkruaj një email të vlefshëm.");
      return;
    }
    if (trimmedMessage === "") {
      setError("Shkruaj mesazhin.");
      return;
    }
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
      <p className="m-0 max-w-xl text-base leading-relaxed font-semibold text-ink" role="status">
        Mesazhi u dërgua. Do të kthehemi sa më shpejt.
      </p>
    );
  }

  return (
    <form className="mt-6 grid max-w-xl gap-5" onSubmit={onSubmit} noValidate>
      {intro ? (
        <p className="m-0 text-base leading-relaxed text-muted">{intro}</p>
      ) : null}
      <label className={fieldLabel}>
        <span>Emri *</span>
        <input
          className={inputClass}
          name="name"
          autoComplete="name"
          value={name}
          maxLength={120}
          disabled={pending}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <label className={fieldLabel}>
        <span>Email *</span>
        <input
          className={inputClass}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          maxLength={255}
          disabled={pending}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className={fieldLabel}>
        <span>Telefoni</span>
        <input
          className={inputClass}
          type="tel"
          name="phone"
          autoComplete="tel"
          value={phone}
          maxLength={40}
          disabled={pending}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="opsionale"
        />
      </label>
      <label className={fieldLabel}>
        <span>Mesazhi *</span>
        <textarea
          className={`${inputClass} min-h-32 resize-y`}
          name="message"
          value={message}
          maxLength={5000}
          disabled={pending}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
      </label>
      {error ? (
        <p className={fieldError} role="alert">
          {error}
        </p>
      ) : null}
      <button className={`${btnPrimary} w-fit`} type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Duke u dërguar…" : "Dërgo mesazhin"}
      </button>
    </form>
  );
}
