"use client";

import { useState, type FormEvent } from "react";
import { Spinner } from "@/components/ui/Spinner";
import {
  InquiryField,
  InquiryInput,
  InquiryTextarea,
} from "@/features/public/inquiry/InquiryField";
import { InquirySuccess } from "@/features/public/inquiry/InquirySuccess";
import {
  inquiryError,
  inquiryForm,
  inquiryPanel,
  inquirySubmit,
} from "@/features/public/inquiry/styles";
import { apiFetch, validationMessage } from "@/lib/api";

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
        <InquiryField label="Emri" required htmlFor="contact-name">
          <InquiryInput
            id="contact-name"
            name="name"
            autoComplete="name"
            value={name}
            maxLength={120}
            disabled={pending}
            invalid={invalid.name}
            placeholder="Emri yt"
            onChange={(event) => {
              setName(event.target.value);
              setInvalid((prev) => ({ ...prev, name: false }));
            }}
            required
          />
        </InquiryField>
        <InquiryField label="Email" required htmlFor="contact-email">
          <InquiryInput
            id="contact-email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            maxLength={255}
            disabled={pending}
            invalid={invalid.email}
            placeholder="email@shembull.com"
            onChange={(event) => {
              setEmail(event.target.value);
              setInvalid((prev) => ({ ...prev, email: false }));
            }}
            required
          />
        </InquiryField>
        <InquiryField label="Telefoni" htmlFor="contact-phone">
          <InquiryInput
            id="contact-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            value={phone}
            maxLength={40}
            disabled={pending}
            placeholder="p.sh. +383 44 000 000"
            onChange={(event) => setPhone(event.target.value)}
          />
        </InquiryField>
        <InquiryField label="Mesazhi" required htmlFor="contact-message">
          <InquiryTextarea
            id="contact-message"
            name="message"
            value={message}
            maxLength={5000}
            disabled={pending}
            invalid={invalid.message}
            placeholder="Si mund të të ndihmojmë?"
            onChange={(event) => {
              setMessage(event.target.value);
              setInvalid((prev) => ({ ...prev, message: false }));
            }}
            required
          />
        </InquiryField>
        {error ? (
          <p className={inquiryError} role="alert">
            {error}
          </p>
        ) : null}
        <div className="pt-1">
          <button className={inquirySubmit} type="submit" disabled={pending} aria-busy={pending}>
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
