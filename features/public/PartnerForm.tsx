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
import { kicker } from "@/features/public/tone";
import { apiFetch, validationMessage } from "@/lib/api";
import { button, input } from "@/lib/ui";

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

type FieldKey = "name" | "email" | "businessName" | "city";

export function PartnerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
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
    const trimmedBusiness = businessName.trim();
    const trimmedCity = city.trim();
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
    if (trimmedBusiness === "") {
      nextInvalid.businessName = true;
      setInvalid(nextInvalid);
      setError("Shkruaj emrin e dyqanit.");
      return;
    }
    if (trimmedCity === "") {
      nextInvalid.city = true;
      setInvalid(nextInvalid);
      setError("Shkruaj qytetin.");
      return;
    }
    setInvalid({});
    setError(null);
    setPending(true);
    try {
      await apiFetch("/partner", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          business_name: trimmedBusiness,
          city: trimmedCity,
          phone: phone.trim() || null,
          message: message.trim() || null,
        }),
      });
      setDone(true);
      setName("");
      setEmail("");
      setBusinessName("");
      setCity("");
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
        title="Aplikimi u dërgua"
        body="Faleminderit. Ekipi ynë do të shikojë aplikimin dhe do të të kontaktojë së shpejti."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div className={inquiryPanel}>
        <p className={kicker}>Aplikimi</p>
        <form className={`${inquiryForm} mt-5`} onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="partner-name" label="Emri" requirement="required">
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
            <Field id="partner-email" label="Email" requirement="required">
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
                  placeholder="email@dyqani.com"
                  className={input({ size: "lg" })}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setInvalid((prev) => ({ ...prev, email: false }));
                  }}
                />
              )}
            </Field>
          </div>
          <Field id="partner-shop" label="Emri i dyqanit" requirement="required">
            {(control) => (
              <input
                {...control}
                name="business_name"
                autoComplete="organization"
                value={businessName}
                maxLength={160}
                disabled={pending}
                aria-invalid={invalid.businessName || undefined}
                placeholder="Si quhet dyqani"
                className={input({ size: "lg" })}
                onChange={(event) => {
                  setBusinessName(event.target.value);
                  setInvalid((prev) => ({ ...prev, businessName: false }));
                }}
              />
            )}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="partner-city" label="Qyteti" requirement="required">
              {(control) => (
                <input
                  {...control}
                  name="city"
                  autoComplete="address-level2"
                  value={city}
                  maxLength={120}
                  disabled={pending}
                  aria-invalid={invalid.city || undefined}
                  placeholder="p.sh. Prishtinë"
                  className={input({ size: "lg" })}
                  onChange={(event) => {
                    setCity(event.target.value);
                    setInvalid((prev) => ({ ...prev, city: false }));
                  }}
                />
              )}
            </Field>
            <Field id="partner-phone" label="Telefoni" requirement="optional">
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
          </div>
          <Field id="partner-message" label="Mesazhi" requirement="optional">
            {(control) => (
              <textarea
                {...control}
                name="message"
                value={message}
                maxLength={5000}
                disabled={pending}
                placeholder="Diçka që dëshiron të na tregosh (opsionale)"
                className={`${input({ size: "lg", multiline: true })} min-h-28 resize-y leading-relaxed`}
                onChange={(event) => setMessage(event.target.value)}
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
                "Dërgo aplikimin"
              )}
            </button>
          </div>
        </form>
      </div>
      <p className="m-0 max-w-xl text-sm leading-relaxed text-muted">
        Pas dërgimit, ekipi ynë shikon aplikimin dhe të kontakton me hapat e
        ardhshëm. Nuk ka pagesë për të aplikuar.
      </p>
    </div>
  );
}
