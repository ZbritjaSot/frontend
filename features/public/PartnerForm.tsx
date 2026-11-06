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
import { useFocusInvalidField } from "@/features/public/inquiry/useFocusInvalidField";
import { kicker } from "@/features/public/tone";
import { apiFetch, validationMessage } from "@/lib/api";
import { button, input } from "@/lib/ui";
import { fieldMessages, partnerFormSchema } from "@/schemas/inquiry";

const fields = ["name", "email", "businessName", "city", "phone", "message"] as const;
type FieldKey = (typeof fields)[number];

const fieldIds: Record<FieldKey, string> = {
  name: "partner-name",
  email: "partner-email",
  businessName: "partner-shop",
  city: "partner-city",
  phone: "partner-phone",
  message: "partner-message",
};

export function PartnerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const invalidField = useFocusInvalidField();

  function clearError(key: FieldKey) {
    setErrors((current) => {
      if (!current[key]) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = partnerFormSchema.safeParse({
      name,
      email,
      businessName,
      city,
      phone,
      message,
    });
    if (!parsed.success) {
      const next = fieldMessages(parsed.error.issues, fields);
      setErrors(next);
      setServerError(null);
      const first = fields.find((key) => next[key]);
      if (first) {
        invalidField.focus(fieldIds[first]);
      }
      return;
    }

    setErrors({});
    setServerError(null);
    setPending(true);
    try {
      await apiFetch("/partner", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          business_name: parsed.data.businessName,
          city: parsed.data.city,
          phone: parsed.data.phone,
          message: parsed.data.message,
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
      setServerError(validationMessage(caught, "Nuk u dërgua. Provo përsëri."));
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
            <Field id="partner-name" label="Emri" requirement="required" error={errors.name}>
              {(control) => (
                <input
                  {...control}
                  name="name"
                  autoComplete="name"
                  value={name}
                  maxLength={120}
                  disabled={pending}
                  placeholder="Emri yt"
                  className={input({ size: "lg" })}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearError("name");
                  }}
                />
              )}
            </Field>
            <Field id="partner-email" label="Email" requirement="required" error={errors.email}>
              {(control) => (
                <input
                  {...control}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  maxLength={255}
                  disabled={pending}
                  placeholder="email@dyqani.com"
                  className={input({ size: "lg" })}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                  }}
                />
              )}
            </Field>
          </div>
          <Field
            id="partner-shop"
            label="Emri i dyqanit"
            requirement="required"
            error={errors.businessName}
          >
            {(control) => (
              <input
                {...control}
                name="business_name"
                autoComplete="organization"
                value={businessName}
                maxLength={160}
                disabled={pending}
                placeholder="Si quhet dyqani"
                className={input({ size: "lg" })}
                onChange={(event) => {
                  setBusinessName(event.target.value);
                  clearError("businessName");
                }}
              />
            )}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="partner-city" label="Qyteti" requirement="required" error={errors.city}>
              {(control) => (
                <input
                  {...control}
                  name="city"
                  autoComplete="address-level2"
                  value={city}
                  maxLength={120}
                  disabled={pending}
                  placeholder="p.sh. Prishtinë"
                  className={input({ size: "lg" })}
                  onChange={(event) => {
                    setCity(event.target.value);
                    clearError("city");
                  }}
                />
              )}
            </Field>
            <Field id="partner-phone" label="Telefoni" requirement="optional" error={errors.phone}>
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
                  onChange={(event) => {
                    setPhone(event.target.value);
                    clearError("phone");
                  }}
                />
              )}
            </Field>
          </div>
          <Field id="partner-message" label="Mesazhi" requirement="optional" error={errors.message}>
            {(control) => (
              <textarea
                {...control}
                name="message"
                value={message}
                maxLength={5000}
                disabled={pending}
                placeholder="Diçka që dëshiron të na tregosh (opsionale)"
                className={`${input({ size: "lg", multiline: true })} min-h-28 resize-y leading-relaxed`}
                onChange={(event) => {
                  setMessage(event.target.value);
                  clearError("message");
                }}
              />
            )}
          </Field>
          {serverError ? (
            <p className={inquiryError} role="alert">
              {serverError}
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
